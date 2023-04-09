import { action, makeAutoObservable } from 'mobx'
import localforage from 'localforage'
import { LoginResponseState, Receive, ReceiveLoginResponseData, Send, SendUserSendRequestData } from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { ReceiveSendRequestResponseData } from '../utils/message'
import { SendRequestResponseState } from '../utils/message'
import { authStore } from './authStore'

enum RequestContentType {
    MakeFriend = 'MakeFriend',
    JoinGroup = 'JoinGroup'
}

interface MakeFriendRequest {
    type: RequestContentType.MakeFriend
    receiverId: number
}
interface JoinGroupRequest {
    type: RequestContentType.JoinGroup
    chatId: number
}

type RequestContent = MakeFriendRequest | JoinGroupRequest

interface RequestInfo {
    reqId: number,
    senderId: number,
    message: string,
    content: RequestContent,
}

enum RequestState {
    Unsolved = 'Unsolved',
    Refused = 'Refused',
    Approved = 'Approved',
}

interface ReceiveRequest {
    state: RequestState
    info: RequestInfo
}

class Request {
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

class RequestStore {
    errors: string = ''
    message: string = ''
    clientId: ClientId = 0
    requsetStash: Map<ClientId, Request | null> = new Map()
    requests: Map<ReqId, Request> = new Map()
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.Request, this.receiveRequestHandler)
        MessageServer.on(Receive.SendRequestResponse, this.sendRequestResponseHandler)
    }
    toggleClientId() {
        this.clientId++
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
            switch (data.errorType) {
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
    receiveRequestHandler(data: string) {
        const req: ReceiveRequest = JSON.parse(data)
        this.setRequest(Request.createFromReceiveRequest(req))
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
