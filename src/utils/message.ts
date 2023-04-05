
/*--------------------Receive数据类型----------------------*/
export enum SetConnectionPubKeyState {
    NeedSetPubKey = 'NeedSetPubKey',
    PubKeyError = 'PubKeyError',
    HasApproved = 'HasApproved',
    Success = 'Success',
}
export interface ReceiveSetConnectionPubKeyResponseData { // Something to do 
    state: SetConnectionPubKeyState,
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
}
export interface ReceiveLoginResponseData {
    state: LoginResponseState,
    userId?: number
}

export enum RegisterResponseState {
    Success = 'Success',
    UserNameFormatError = 'UserNameFormatError',
    PasswordFormatError = 'PasswordFormatError',
    EmailRegistered = 'EmailRegistered',
    ServerError = 'ServerError'
}
export interface ReceiveRegisterResponseData {
    state: RegisterResponseState,
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
    state: SendMessageResponseState,
    clientId: number,
    serverId: number,
}

export enum SendRequestResponseState {
    Error = 'Error',
    Success = 'Success'
}
export interface ReceiveSendRequestResponseData {
    state: SendRequestResponseState,
    reqId: number,
    clientId: number
}

export enum ReceiveSolveRequestResponseData {
    Success = 'Success',
    DatabaseError = 'DatabaseError',
    NotHandler = 'NotHandler',
    Unsolved = 'Unsolved',
}

export enum PullResponseState {
    DatabaseError = 'DatabaseError',
    Success = 'Success',
}
export interface ReceivePullResponseData { // TODO
    state: PullResponseState,
    chats?: ChatInfo[],
    messages: ChatMessage[],
}

export interface ChatInfo {
    id: number,
    name: string,
    avater: string,
}

export interface ChatMessage {
    serverId: number,
    chatId: number,
    senderId: number,
    inChatId: number,
    text: string,
    timestamp: number
}

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
    type: UserRequestContentType,
    userId?: number,
    chatId?: number,
    message: string,
}
export interface UserRequest {
    reqId: number,
    senderId: number,
    message: string,
    content: UserRequsetContent,
    state: UserRequestState,
}

export enum ReceiveGetUserInfoResponseState {
    Success = 'Success',
    UserNotFound = 'UserNotFound',
    ServerError = 'ServerError',
}

export interface ReceiveGetUserInfoResponseData { // TODO
    state: ReceiveGetUserInfoResponseState,

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
    Messages = 'Messages',
    Message = 'Message',
    Request = 'Request',
    Requests = 'Requests',
    UpdateRequest = 'UpdateRequest',
    UpdateMessage = 'UpdateMessage',
}

/*--------------------Send数据类型----------------------*/
export type SendSetConnectionPubKeyData = string
export interface SendRegisterData {
    userName: string,
    password: string,
    email: string,
    emailCode: number,
}
export interface SendLoginData {
    email: string,
    password?: string,
    emailCode?: number,
}
export interface SendSendMessageData {
    clientId: number,
    chatId: number,
    text: string,
    timestamp: number,
}

export interface SendPullData {
    lastChatId: number,
    lastMessageId: number,
    lastRequestId: number
}
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
}

// COMMAND和DATA类型捆绑
export interface MessageReceiveData {
    [Receive.Ping]: never,
    [Receive.Pong]: never,
    [Receive.Close]: never,
    [Receive.SetConnectionSymKey] : ReceiveSetConnectionSymKeyData,
    [Receive.SetConnectionPubKeyResponse]: ReceiveSetConnectionPubKeyResponseData,
    [Receive.LoginResponse]: ReceiveLoginResponseData,
    [Receive.RegisterResponse]: ReceiveRegisterResponseData,
    [Receive.SendMessageResponse]: ReceiveSendMessageResponseData,
    [Receive.SendRequestResponse]: ReceiveSendRequestResponseData,
    [Receive.SolveRequestResponse]: ReceiveSolveRequestResponseData,
    [Receive.PullResponse]: ReceivePullResponseData,
    [Receive.Chat]: ChatInfo,
    [Receive.Chats]: ChatInfo[],
    [Receive.Messages]: ChatMessage[],
    [Receive.Message]: ChatMessage,
    [Receive.Request]: UserRequest,
    [Receive.Requests]: UserRequest[],
    [Receive.UpdateRequest]: UserRequest,
    [Receive.UpdateMessage]: ChatMessage,
    [Receive.GetUserInfoResponse]: ReceiveGetUserInfoResponseData,
}

export interface MessageSendData {
    [Send.Ping]: never,
    [Send.Pong]: never,
    [Send.Close]: never,
    [Send.SetConnectionPubKey]: SendSetConnectionPubKeyData,
    [Send.Register]: SendRegisterData,
    [Send.Login]: SendLoginData,
    [Send.SendMessage]: SendSendMessageData,
    [Send.Pull]: SendPullData,
    [Send.GetUserInfo]: number,
}

// 封装消息包
export type DataType<T extends Send | Receive> = T extends Send
    ? MessageSendData[Send]
    : MessageReceiveData[Receive]

export interface MessageBody<T extends Send | Receive> {
    command: T
    data?: DataType<T>
}

