import { action, makeAutoObservable } from 'mobx'
import localforage from 'localforage'
import {
    LoginResponseState,
    Receive,
    ReceiveLoginResponseData,
    ReceiveRequestStateUpdateData,
    ReceiveSolveRequestResponseData,
    RequestError,
    Send,
    SendUserSendRequestData,
} from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { ReceiveSendRequestResponseData } from '../utils/message'
import { SendRequestResponseState } from '../utils/message'
import { authStore } from './authStore'
import { User, userStore } from './userStore'
import { LocalDatabase } from './localData'
import { Chat, chatStore } from './chatStore'

export enum RequestContentType {
    MakeFriend = 'MakeFriend',
    JoinGroup = 'JoinGroup',
    GroupInvitation = 'GroupInvitation',
    InvitedJoinGroup = 'InvitedJoinGroup',
}

export interface MakeFriendRequest {
    type: RequestContentType.MakeFriend
    receiverId: number
}
export interface JoinGroupRequest {
    type: RequestContentType.JoinGroup
    chatId: number
}

export interface GroupInvitationRequest {
    type: RequestContentType.GroupInvitation
    receiverId: number
    chatId: number
}

export interface InvitedJoinGroupRequest {
    type: RequestContentType.InvitedJoinGroup
    inviterId: number
    chatId: number
}

export type RequestContent = MakeFriendRequest | JoinGroupRequest | GroupInvitationRequest | InvitedJoinGroupRequest

interface RequestInfo {
    reqId: number
    senderId: number
    message: string
    content: RequestContent
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

    sendUser: User | null = null
    receiveUser: User | null = null
    inviteUser: User | null = null
    chat: Chat | null = null

    message: string = ''
    content: RequestContent = {
        type: RequestContentType.MakeFriend,
        receiverId: 0,
    }

    get isSender() {
        return authStore && this.senderId === authStore.userId
    }

    get showId() {
        switch (this.content.type) {
            case RequestContentType.MakeFriend:
                return this.isSender ? this.content.receiverId : this.senderId
            case RequestContentType.JoinGroup:
                return this.isSender ? this.content.chatId : this.senderId
            case RequestContentType.GroupInvitation:
                return this.isSender ? this.content.receiverId : this.senderId
            case RequestContentType.InvitedJoinGroup:
                return this.senderId
        }
    }
    get title() {
        switch (this.content.type) {
            case RequestContentType.MakeFriend:
                return '好友申请'
            case RequestContentType.JoinGroup:
                return '群聊申请'
            case RequestContentType.GroupInvitation:
                return `群聊 ${this.chat?.name} 的邀请`
            case RequestContentType.InvitedJoinGroup:
                return `群聊审核: ${this.chat?.name}`
        }
    }
    get textTip() {
        if (this.content.type === RequestContentType.JoinGroup) {
            return this.isSender ? this.chat?.name : this.sendUser?.name
        } else if(this.content.type === RequestContentType.InvitedJoinGroup) {
            return this.inviteUser?.showName + '邀请' + this.sendUser?.showName + '入群'
        } 
        else {
            return this.isSender ? this.receiveUser?.showName : this.sendUser?.showName
        }
    }

    constructor({
        state,
        reqId,
        senderId,
        message,
        content,
    }: {
        state: RequestState
        reqId: number
        senderId: number
        message: string
        content: RequestContent
    }) {
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
                receiverId: 0,
            },
        })
    }

    bindObject() {
        if (this.senderId === 0) return this
        this.sendUser = userStore.getUser(this.senderId)
        switch (this.content.type) {
            case RequestContentType.MakeFriend:
                this.receiveUser = userStore.getUser(this.content.receiverId)
                break
            case RequestContentType.JoinGroup:
                this.chat = chatStore.getChat(this.content.chatId)
                break
            case RequestContentType.GroupInvitation:
                this.receiveUser = userStore.getUser(this.content.receiverId)
                this.chat = chatStore.getChat(this.content.chatId)
                break
            case RequestContentType.InvitedJoinGroup:
                this.inviteUser = userStore.getUser(this.content.inviterId)
                this.chat = chatStore.getChat(this.content.chatId)
            break
            default:
                console.log('只要到达，那个地方...')
        }
        return this
    }

    static createFromReceiveRequest(req: ReceiveRequest) {
        return new Request({
            state: req.state,
            ...req.info,
        }).bindObject()
    }
    static createFromSendRequest({
        message,
        content,
    }: {
        message: string
        content: RequestContent
    }) {
        return new Request({
            state: RequestState.Unsolved,
            reqId: 0,
            senderId: authStore.userId,
            message: message,
            content: content,
        }).bindObject()
    }

    setToSelf(req: Request) {
        this.state = req.state
        this.senderId = req.senderId
        this.reqId = req.reqId
        this.message = req.message
        this.content = req.content
        this.sendUser = req.sendUser
        this.receiveUser = req.receiveUser
        this.chat = req.chat
    }
    serialized(): string {
        const request = {
            state: this.state,
            reqId: this.reqId,
            senderId: this.senderId,
            message: this.message,
            content: this.content,
        }
        return JSON.stringify(request)
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

    reset() {
        this.errors = ''
        this.message = ''
        this.clientId = 0
        this.requsetStash.clear()
        this.requests.clear()
    }

    get requestsList() {
        const unsolvedRequests: Request[] = []
        const waitintSolvedRequests: Request[] = []
        const solvedRequests: Request[] = []
        this.requests.forEach((req, _) => {
            if (req.state === RequestState.Unsolved) {
                if (req.senderId !== authStore.userId) unsolvedRequests.push(req)
                else waitintSolvedRequests.push(req)
            } else {
                solvedRequests.push(req)
            }
        })
        return unsolvedRequests.concat(waitintSolvedRequests, solvedRequests)
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
        } else if (data.state === SendRequestResponseState.DatabaseError) {
            this.errors = '服务器数据异常'
        } else {
            switch (data.state.RequestError.errorType) {
                case 'SameUser':
                    this.errors = '不能添加自己为好友'
                    break
                case 'AlreadyBeFrineds':
                    this.errors = '已经添加过该好友'
                    break
                case 'AlreadyInGroup':
                    const req = this.requsetStash.get(data.clientId)
                    req && req.receiveUser
                        ? (this.errors = `${req.receiveUser.showName}已加入该群聊`)
                        : (this.errors = '已加入该群聊')
                    break
                case 'RequestExisted':
                    this.errors = '已向该用户发送过请求，或尚未处理对方请求'
                    break
                case 'UserNotFound':
                    this.errors = '未找到该用户'
                    break
            }
        }
        if (this.requsetStash.has(data.clientId)) this.requsetStash.delete(data.clientId)
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

    sendMakeFriendRequest(receiverId: number | null) {
        if (receiverId === null) {
            this.errors = '用户ID不能为空, 请输入用户ID'
            return
        }
        this.requsetStash.set(
            this.clientId,
            Request.createFromSendRequest({
                message: this.message,
                content: {
                    type: RequestContentType.MakeFriend,
                    receiverId: receiverId!,
                },
            })
        )
        MessageServer.Instance().send(Send.SendRequest, {
            clientId: this.clientId,
            message: this.message,
            content: {
                type: RequestContentType.MakeFriend,
                receiverId: receiverId!,
            },
        })
        this.message = ''
        this.toggleClientId()
    }
    sendJoinGroupRequest(chatId: number | null) {
        if (chatId === null) {
            this.errors = '群聊ID不能为空, 请输入群聊ID'
            return
        }
        this.requsetStash.set(
            this.clientId,
            Request.createFromSendRequest({
                message: this.message,
                content: {
                    type: RequestContentType.JoinGroup,
                    chatId: chatId,
                },
            })
        )
        MessageServer.Instance().send(Send.SendRequest, {
            clientId: this.clientId,
            message: this.message,
            content: {
                type: RequestContentType.JoinGroup,
                chatId: chatId,
            },
        })
        this.message = ''
        this.toggleClientId()
    }
    sendGroupInvitationRequest(chatId: number, receiverId: number | null) {
        if (receiverId === null) {
            this.errors = '用户ID不能为空, 请输入用户ID'
            return
        }
        this.requsetStash.set(
            this.clientId,
            Request.createFromSendRequest({
                message: '欢迎加入群聊',
                content: {
                    type: RequestContentType.GroupInvitation,
                    chatId: chatId,
                    receiverId: receiverId,
                },
            })
        )
        MessageServer.Instance().send(Send.SendRequest, {
            clientId: this.clientId,
            message: '欢迎加入群聊',
            content: {
                type: RequestContentType.GroupInvitation,
                chatId: chatId,
                receiverId: receiverId,
            },
        })
        this.message = ''
        this.toggleClientId()
    }

    setRequest(req: Request) {
        req.bindObject()
        const request = this.requests.get(req.reqId)
        if (request === undefined) {
            this.requests.set(req.reqId, req)
        } else {
            request.setToSelf(req)
        }
        LocalDatabase.saveRequest(req.reqId, req) // 本地缓存
    }

    getRequest(reqId: ReqId) {
        if (this.requests.has(reqId)) {
            return this.requests.get(reqId)
        }
        const req = Request.getLoadingRequest(reqId)
        this.requests.set(reqId, req)
        //TODO-拉取Request
        LocalDatabase.loadRequest(reqId)
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
        const reqs: ReceiveRequest[] = data.map((serializedReq) => JSON.parse(serializedReq))
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
            answer: 'Approved',
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
            answer: 'Refused',
        })
    }
    get showError() {
        return this.errors !== ''
    }
}

export const requestStore = new RequestStore()
