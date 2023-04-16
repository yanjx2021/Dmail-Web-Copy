import { RequestState } from "../stores/requestStore"

import { ChatId } from "../stores/chatStore"
import { UserId } from "../stores/authStore"

/*--------------------Receive数据类型----------------------*/
export enum SetConnectionPubKeyState {
    NeedSetPubKey = 'NeedSetPubKey',
    PubKeyError = 'PubKeyError',
    HasApproved = 'HasApproved',
    Success = 'Success',
}
export interface ReceiveSetConnectionPubKeyResponseData {
    // Something to do
    state: SetConnectionPubKeyState
    pubKey?: string
}

export type ReceiveSetConnectionSymKeyData = string

export enum LoginResponseState {
    Success = 'Success',
    Unapproved = 'Unapproved',
    UserNotFound = 'UserNotFound',
    UserLogged = 'UserLogged',
    PasswordError = 'PasswordError',
    ServerError = 'ServerError',
    NeedLogin = 'NeedLogin',
    EmailCodeError = 'EmailCodeError',
}
export interface ReceiveLoginResponseData {
    state: LoginResponseState
    userId?: number
}

export enum RegisterResponseState {
    Success = 'Success',
    UserNameFormatError = 'UserNameFormatError',
    PasswordFormatError = 'PasswordFormatError',
    EmailRegistered = 'EmailRegistered',
    ServerError = 'ServerError',
    EmailCodeError = 'EmailCodeError',
    EmailInvalid = 'EmailInvalid'
}
export interface ReceiveRegisterResponseData {
    state: RegisterResponseState
    userId?: number
}

export enum SendMessageResponseState {
    ServerError = 'ServerError',
    DatabaseError = 'DatabaseError',
    LenthLimitExceeded = 'LenthLimitExceeded',
    UserNotInChat = 'UserNotInChat',
    UserNotLoggedIn = 'UserNotLoggedIn',
    UserBannedInChat = 'UserBannedInChat',
    Success = 'Success',
}
export interface ReceiveSendMessageResponseData {
    state: SendMessageResponseState
    clientId: number
    chatId : number
    inChatId?: number
    timestamp?: number
}

export interface RequestError {
    RequestError: RequestErrorData
}

export interface RequestErrorData {
    errorType: "AlreadyBeFrineds" | 'SameUser' | 'AlreadyInGroup' | 'RequestExisted' | 'UserNotFound'
    type: 'MakeFriend' | 'JoinGroup'
}

export enum SendRequestResponseState {
    Success = 'Success',
    DatabaseError = 'DatabaseError',
}
export interface ReceiveSendRequestResponseData {
    state: SendRequestResponseState | RequestError
    reqId?: number
    clientId: number
}

export enum ReceiveSolveRequestResponseState {
    Success = 'Success',
    DatabaseError = 'DatabaseError',
    NotHandler = 'NotHandler',
    Unsolved = 'Unsolved',
}

export interface ReceiveSolveRequestResponseData {
    state: ReceiveSolveRequestResponseState
    reqId: number
}

export enum PullResponseState {
    DatabaseError = 'DatabaseError',
    Success = 'Success',
}
export interface ReceivePullResponseData {
    // TODO
    state: PullResponseState
}

export interface ReceiveChatInfo {
    id: number
    name: string
    avater: string
}

export type SerializedReceiveChatInfo = string

export interface ReceiveChatMessage {
    chatId: number
    senderId: number
    inChatId: number
    text: string
    timestamp: number
}

export type SerializedReceiveChatMessage = string

export enum UserRequestState {
    Unsolved = 'Unsolved',
    Refused = 'Refused',
    Approved = 'Approved',
}
export enum UserRequestContentType {
    MakeFriend = 'MakeFriend',
    JoinGroup = 'JoinGroup',
}
export interface UserRequsetContent {
    type: UserRequestContentType
    userId?: number
    chatId?: number
    message: string
}
export interface UserRequest {
    reqId: number
    senderId: number
    message: string
    content: UserRequsetContent
    state: UserRequestState
}

export type SerializedUserRequest = string

export enum ReceiveGetUserInfoResponseState {
    Success = 'Success',
    UserNotFound = 'UserNotFound',
    ServerError = 'ServerError',
}

export interface ReceiveGetUserInfoResponseData {
    // TODO
    state: ReceiveGetUserInfoResponseState
    userId?: number
    userName?: string
    avaterPath?: string
}

export interface ReceiveRequestStateUpdateData {
    reqId: number
    state: RequestState
}

export interface ReceiveCreateGroupChatResponse {
    state: 'Success' | 'DatabaseError'
    chatId?: number
}

export interface ReceivePullUserSettingResponseData {
    state: 'Success' | 'UserNotFound' | 'ServerError'
    content?: string
}

export interface ReceiveUpdateUserInfoResponseData {
    state: 'Success' | 'UserNameFormatError' | 'PasswordFormatError' | 'AvaterPathFormatError' | 'ServerError'
}

/*--------------------Receive数据类型----------------------*/

export enum Receive {
    Ping = 'Ping',
    Pong = 'Pong',
    Close = 'Close',
    SetConnectionSymKey = 'SetConnectionSymKey',
    SetConnectionPubKeyResponse = 'SetConnectionPubKeyResponse',
    LoginResponse = 'LoginResponse',
    RegisterResponse = 'RegisterResponse',
    SendMessageResponse = 'SendMessageResponse',
    SendRequestResponse = 'SendRequestResponse',
    GetUserInfoResponse = 'GetUserInfoResponse', // TODO
    SolveRequestResponse = 'SolveRequestResponse',
    PullResponse = 'PullResponse',
    Chat = 'Chat',
    Chats = 'Chats',
    Message = 'Message',
    Messages = 'Messages',
    Request = 'Request',
    Requests = 'Requests',
    UpdateRequest = 'UpdateRequest',
    UpdateMessage = 'UpdateMessage',
    RequestStateUpdate = 'RequestStateUpdate',
    CreateGroupChatResponse = 'CreateGroupChatResponse',
    PullUserSettingResponse = 'PullUserSettingResponse',
    UpdateUserInfoResponse = 'UpdateUserInfoResponse'
}

/*--------------------Send数据类型----------------------*/
export type SendSetConnectionPubKeyData = string
export interface SendRegisterData {
    userName: string
    password: string
    email: string
    emailCode: number
}
export interface SendLoginData {
    email: string
    password?: string
    emailCode?: number
}
export interface SendSendMessageData {
    clientId: number
    chatId: number
    timestamp : number
    text: string
}

export interface SendPullData {
    lastChatId: number
    lastMessageId: number
    lastRequestId: number
}

export interface UserRequestContent {
    type: 'MakeFriend' | 'JoinGroup'
    receiverId?: number
    chatId?: number
}

export interface SendUserSendRequestData {
    message: string
    content: UserRequestContent
    clientId: number
}

export interface SendSolveRequestData {
    reqId: number,
    answer: 'Refused' | 'Approved'
}
export interface SendCreateGroupChatData {
    name: string,
    avaterPath: string
}

export interface SendGetMessagesData {
    chatId: number,
    startId : number,
    endId : number
}

export interface UpdateUserName {
    type: 'UserName',
    newName: string,
}
export interface UpdateAvaterPath {
    type: 'AvaterPath',
    newPath: string,
}

export interface UpdatePassword {
    type: 'Password',
    newPassword: string,
    emailCode: number
}

export type SendUpdateUserInfoData = UpdateUserName | UpdatePassword | UpdateAvaterPath


/*--------------------Send数据类型----------------------*/

export enum Send {
    Ping = 'Ping', // 心跳包
    Pong = 'Pong',
    Close = 'Close',
    SetConnectionPubKey = 'SetConnectionPubKey', // 发送密钥
    Register = 'Register', // 发送注册信息
    Login = 'Login', // 发送登录请求
    SendMessage = 'SendMessage',
    Pull = 'Pull',
    GetUserInfo = 'GetUserInfo',
    SendRequest = 'SendRequest',
    SolveRequest = 'SolveRequest',
    CreateGroupChat = 'CreateGroupChat',
    GetMessages = 'GetMessages',
    GetChatInfo = 'GetChatInfo',
    SendUserSetting = 'SendUserSetting',
    PullUserSetting = 'PullUserSetting',
    UpdateUserInfo = 'UpdateUserInfo',
}

// COMMAND和DATA类型捆绑
export interface MessageReceiveData {
    [Receive.Ping]: never
    [Receive.Pong]: never
    [Receive.Close]: never
    [Receive.SetConnectionSymKey]: ReceiveSetConnectionSymKeyData
    [Receive.SetConnectionPubKeyResponse]: ReceiveSetConnectionPubKeyResponseData
    [Receive.LoginResponse]: ReceiveLoginResponseData
    [Receive.RegisterResponse]: ReceiveRegisterResponseData
    [Receive.SendMessageResponse]: ReceiveSendMessageResponseData
    [Receive.SendRequestResponse]: ReceiveSendRequestResponseData
    [Receive.SolveRequestResponse]: ReceiveSolveRequestResponseData
    [Receive.PullResponse]: ReceivePullResponseData
    [Receive.Chat]: SerializedReceiveChatInfo
    [Receive.Chats]: SerializedReceiveChatInfo[]
    [Receive.Messages]: SerializedReceiveChatMessage[]
    [Receive.Message]: SerializedReceiveChatMessage
    [Receive.Request]: SerializedUserRequest
    [Receive.Requests]: SerializedUserRequest[]
    [Receive.UpdateRequest]: UserRequest
    [Receive.UpdateMessage]: ReceiveChatMessage
    [Receive.GetUserInfoResponse]: ReceiveGetUserInfoResponseData
    [Receive.RequestStateUpdate]: ReceiveRequestStateUpdateData
    [Receive.CreateGroupChatResponse]: ReceiveCreateGroupChatResponse
    [Receive.PullUserSettingResponse]: ReceivePullUserSettingResponseData
    [Receive.UpdateUserInfoResponse]: ReceiveUpdateUserInfoResponseData
}

export interface MessageSendData {
    [Send.Ping]: never
    [Send.Pong]: never
    [Send.Close]: never
    [Send.SetConnectionPubKey]: SendSetConnectionPubKeyData
    [Send.Register]: SendRegisterData
    [Send.Login]: SendLoginData
    [Send.SendMessage]: SendSendMessageData
    [Send.Pull]: SendPullData
    [Send.GetUserInfo]: number
    [Send.SendRequest]: SendUserSendRequestData
    [Send.SolveRequest]: SendSolveRequestData
    [Send.CreateGroupChat]: SendCreateGroupChatData
    [Send.GetMessages]: SendGetMessagesData
    [Send.GetChatInfo] : ChatId
    [Send.SendUserSetting]: string
    //
    [Send.PullUserSetting]: UserId
    //
    [Send.UpdateUserInfo]: SendUpdateUserInfoData
}

// 封装消息包
export type DataType<T extends Send | Receive> = T extends Send
    ? MessageSendData[Send]
    : MessageReceiveData[Receive]

export interface MessageBody<T extends Send | Receive> {
    command: T
    data?: DataType<T>
}
