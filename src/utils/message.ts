
/*--------------------Receive数据类型----------------------*/
export type ReceiveSetConnectionPubKeyResponseData = string
export interface ReceiveLoginResponseData {
    state: string,
    userId?: number
}
export interface ReceiveRegisterResponseData {
    state: string,
    userId?: number
}

export interface ChatMessage {
    serverId: number,
    clientId: number, // maybe in no need
    chatId: number,
    senderId: number,
    text: string,
}
/*--------------------Receive数据类型----------------------*/

export enum Receive {
    Ping = 'Ping',
    Pong = 'Pong',
    Close = 'Close',
    SetConnectionPubKeyResponse = 'SetConnectionPubKeyResponse', 
    LoginResponse = 'LoginResponse',
    RegisterResponse = 'RegisterResponse', 
    Messages = 'Messages',
}

/*--------------------Send数据类型----------------------*/
export type SendSetConnectPubKeyData = string
export interface SendRegisterData {
    userName: string,
    password: string,
    email: string,
}
export interface SendLoginData {
    userId: number,
    password: string,
}
export interface SendSendMessageData {
    clientId: number,
    chatId: number,
    text: string,
}
/*--------------------Send数据类型----------------------*/

export enum Send {
    Ping = 'Ping', // 心跳包
    Pong = 'Pong',
    Close = 'Close',
    SetConnectPubKey = 'SetConnectionPubKey', // 发送密钥
    Register = 'Register', // 发送注册信息
    Login = 'Login', // 发送登录请求
    SendMessage = 'SendMessage',
}

// COMMAND和DATA类型捆绑
export interface MessageReceiveData {
    [Receive.Ping]: never,
    [Receive.Pong]: never,
    [Receive.Close]: never,
    [Receive.SetConnectionPubKeyResponse]: ReceiveSetConnectionPubKeyResponseData,
    [Receive.LoginResponse]: ReceiveLoginResponseData,
    [Receive.RegisterResponse]: ReceiveRegisterResponseData,
    [Receive.Messages]: ChatMessage[],
}

export interface MessageSendData {
    [Send.Ping]: never,
    [Send.Pong]: never,
    [Send.Close]: never,
    [Send.SetConnectPubKey]: SendSetConnectPubKeyData,
    [Send.Register]: SendRegisterData,
    [Send.Login]: SendLoginData,
    [Send.SendMessage]: SendSendMessageData,
}

// 封装消息包
export type DataType<T extends Send | Receive> = T extends Send
    ? MessageSendData[Send]
    : MessageReceiveData[Receive]

export interface MessageBody<T extends Send | Receive> {
    command: T
    data?: DataType<T>
}

