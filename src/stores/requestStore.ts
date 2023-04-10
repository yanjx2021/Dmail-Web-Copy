import { action, makeAutoObservable } from 'mobx'
import localforage from 'localforage'
import { LoginResponseState, Receive, ReceiveLoginResponseData, ReceiveRequestStateUpdateData, ReceiveSolveRequestResponseData, Send, SendUserSendRequestData } from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { ReceiveSendRequestResponseData } from '../utils/message'
import { SendRequestResponseState } from '../utils/message'
import { authStore } from './authStore'

export enum RequestContentType {
    MakeFriend = 'MakeFriend',
    JoinGroup = 'JoinGroup'
}

export interface MakeFriendRequest {
    type: RequestContentType.MakeFriend
    receiverId: number
}
export interface JoinGroupRequest {
    type: RequestContentType.JoinGroup
    chatId: number
}

export type RequestContent = MakeFriendRequest | JoinGroupRequest

interface RequestInfo {
    reqId: number,
    senderId: number,
    message: string,
    content: RequestContent,
}

export enum RequestState {
    Unsolved = 'Unsolved',
    Refused = 'Refused',
    Approved = 'Approved',
}

interface ReceiveRequest {
    state: RequestState
    info: RequestInfo
}

export class Request {
    state: RequestState = RequestState.Unsolved
    reqId: number = 0
    senderId: number = 0
    message: string = ''
    content: RequestContent = {
        type: RequestContentType.MakeFriend,
        receiverId: 0
    }
    constructor({state, reqId, senderId, message, content} : {state : RequestState, reqId : number, senderId : number, message : string, content : RequestContent}) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.state = state
        this.reqId = reqId
        this.senderId = senderId
        this.message = message
        this.content = content
    }
    static getLoadingRequest(reqId: ReqId) {
        return new Request({
            state: RequestState.Unsolved,
            reqId: reqId,
            senderId: 0,
            message: '正在加载',
            content: {
                type: RequestContentType.MakeFriend,
                receiverId: 0
            }
        })
    }
    static createFromReceiveRequest(req: ReceiveRequest) {
        return new Request({
            state: req.state,
            ...req.info
        })
    }
    static createFromSendRequest({message, content} : {message: string, content: RequestContent}) {
        return new Request({
            state: RequestState.Unsolved,
            reqId: 0,
            senderId: authStore.userId,
            message: message,
            content: content,
        })
    }
    setToSelf(req: Request) {
        this.state = req.state
        this.senderId = req.senderId
        this.reqId = req.reqId
        this.message = req.message
        this.content = req.content
    }
}

type ReqId = number
type ClientId = number

export class RequestStore {
    errors: string = ''
    message: string = ''
    clientId: ClientId = 0
    requsetStash: Map<ClientId, Request> = new Map()
    requests: Map<ReqId, Request> = new Map()

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.Request, this.receiveRequestHandler)
        MessageServer.on(Receive.SendRequestResponse, this.sendRequestResponseHandler)
        MessageServer.on(Receive.SolveRequestResponse, this.solveRequestResponseHandler)
        MessageServer.on(Receive.RequestStateUpdate, this.requestStateUpdateHandler)
        MessageServer.on(Receive.Requests, this.receiveRequestsHandler)
    }
    toggleClientId() {
        this.clientId++
    }

    get requestsList() {
        const unsolvedRequests : {message: string, reqId: number, senderId: number, content: RequestContent, state: RequestState}[] = []
        const waitintSolvedRequests : {message: string, reqId: number, senderId: number, content: RequestContent, state: RequestState}[] = []
        const solvedRequests : {message: string, reqId: number, senderId: number, content: RequestContent, state: RequestState}[] = []
        this.requests.forEach((req, reqId) => {
            if (req.state === RequestState.Unsolved) {
                if (req.senderId !== authStore.userId) unsolvedRequests.push({message: req.message, reqId: reqId, senderId: req.senderId, content: req.content, state: req.state})
                else waitintSolvedRequests.push({message: req.message, reqId: reqId, senderId: req.senderId, content: req.content, state: req.state})
            } else {
                solvedRequests.push({message: req.message, reqId: reqId, senderId: req.senderId, content: req.content, state: req.state})
            }
        })
        return unsolvedRequests.concat(waitintSolvedRequests, solvedRequests)
    }
    get requestStashList() {
        const requests: {message: string, reqId: number}[] = []
        this.requsetStash.forEach((req, reqId) => {
            requests.push({message: req.message, reqId: reqId})
        })
        return requests
    }

    sendRequestResponseHandler(data: ReceiveSendRequestResponseData) {
        if (data.state === SendRequestResponseState.Success) {
            if (!this.requsetStash.has(data.clientId!)) {
                this.errors = '找不到这条请求：' + data.reqId
                return
            }
            let req = this.requsetStash.get(data.clientId!)
            req!.reqId = data.reqId!
            this.setRequest(req!)
            this.requsetStash.delete(data.clientId!)
        } else {
            switch (data.state.RequestError.errorType) {
                case 'SameUser':
                    this.errors = '不能添加自己为好友'
                    break
                case 'AlreadyBeFrineds':
                    this.errors = '已经添加过该好友'
                    break
                case 'AlreadyInGroup':
                    this.errors = '已经在该群聊中了'
                    break
            }
            //TODO-需要clientId
        }
    }

    setRequestState(reqId: number, state: RequestState) {
        if (!this.requests.has(reqId)) {
            this.errors = '找不到这个请求'
            return
        }
        this.requests.get(reqId)!.state = state
    }

    requestStateUpdateHandler(data: ReceiveRequestStateUpdateData) {
        this.setRequestState(data.reqId, data.state)
    }

    sendMakeFriendRequest(receiverId: number) {
        this.requsetStash.set(this.clientId, Request.createFromSendRequest({
            message: this.message,
            content: {
                type: RequestContentType.MakeFriend,
                receiverId: receiverId
            }
        }))
        MessageServer.Instance().send(Send.SendRequest, {
            clientId: this.clientId,
            message: this.message,
            content: {
                type: RequestContentType.MakeFriend,
                receiverId: receiverId
            }
        })
        this.message = ''
        this.toggleClientId()
    }
    sendJoinGroupRequest(chatId: number) {
        this.requsetStash.set(this.clientId, Request.createFromSendRequest({
            message: this.message,
            content: {
                type: RequestContentType.JoinGroup,
                chatId: chatId
            }
        }))
        MessageServer.Instance().send(Send.SendRequest, {
            clientId: this.clientId,
            message: this.message,
            content: {
                type: RequestContentType.JoinGroup,
                chatId: chatId
            }
        })
        this.message = ''
        this.toggleClientId()
    }

    setRequest(req: Request) {
        const request = this.requests.get(req.reqId)
        if (request === undefined) {
            this.requests.set(req.reqId, req)
        } else {
            request.setToSelf(req)
        }
    }
    getRequest(reqId: ReqId) {
        if (this.requests.has(reqId)) {
            return this.requests.get(reqId)
        }
        const req = Request.getLoadingRequest(reqId)
        this.requests.set(reqId, req)
        //TODO-拉取Request
        return req
    }

    solveRequestResponseHandler(data: ReceiveSolveRequestResponseData) {
        const req = this.requests.get(data.reqId)
        if (req === undefined) {
            this.errors = '修改请求状态失败: 找不到这条请求 ' + data.reqId
            return
        }
        if (data.state === 'Success') {
            console.log('成功发送请求处理')
        } else {
            this.errors = '修改请求状态失败：' + data.state
        }
    }

    receiveRequestHandler(data: string) {
        const req: ReceiveRequest = JSON.parse(data)
        this.setRequest(Request.createFromReceiveRequest(req))
    }
    receiveRequestsHandler(data: string[]) {
        console.log(data)
        const reqs: ReceiveRequest[] = data.map((serializedReq) => JSON.parse(serializedReq))
        console.log('reqs', reqs)
        reqs.forEach((req, index) => {
            this.setRequest(Request.createFromReceiveRequest(req))
        })
    }

    approveRequest(reqId: number) {
        const req = this.requests.get(reqId)
        if (req === undefined) {
            console.error('找不到这个requesat' + reqId)
            return
        }
        MessageServer.Instance().send(Send.SolveRequest, {
            reqId: reqId,
            answer: 'Approved'
        })
    }
    refuseRequest(reqId: number) {
        const req = this.requests.get(reqId)
        if (req === undefined) {
            console.error('找不到这个requesat' + reqId)
            return
        }
        MessageServer.Instance().send(Send.SolveRequest, {
            reqId: reqId,
            answer: 'Refused'
        })
    }
}

export const requestStore = new RequestStore()
