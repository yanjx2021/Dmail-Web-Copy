import { RequestContentType, RequestState } from '../stores/requestStore'

import { ChatId, ChatMessageFileInfo, ChatMessageType } from '../stores/chatStore'
import { UserId } from '../stores/authStore'
import { UploadId } from '../stores/fileStore'
import { interceptReads } from 'mobx/dist/internal'

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
    EmailInvalid = 'EmailInvalid',
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
    chatId: number
    inChatId?: number
    timestamp?: number
}

export interface RequestError {
    RequestError: RequestErrorData
}

export interface RequestErrorData {
    errorType:
        | 'AlreadyBeFrineds'
        | 'SameUser'
        | 'AlreadyInGroup'
        | 'RequestExisted'
        | 'UserNotFound'
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
    type: ChatMessageType
    chatId: number
    senderId: number
    inChatId: number
    serializedContent: string
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

export interface UserUploadFileRequestData {
    suffix: string
    userHash: string
    size: number
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
    avaterHash?: string
}

export interface ReceiveRequestStateUpdateData {
    reqId: number
    state: RequestState
}

export interface ReceiveCreateGroupChatResponse {
    state: 'Success' | 'DatabaseError'
    chatId?: number
}

export interface ReceiveUpdateUserInfoResponseData {
    state:
        | 'Success'
        | 'UserNameFormatError'
        | 'PasswordFormatError'
        | 'AvaterPathFormatError'
        | 'ServerError'
        | 'EmailCodeError'
}

export interface ReceiveSetUserSettingResponseData {
    state: 'Success' | any
}

export interface ReceiveUnfriendResponseData {
    state: 'Success' | 'ServerError'
    chatId?: number
}

export interface ReceiveSetAlreadyReadResponseData {
    state: 'Success' | any
}

export interface ReceiveUserUploadFileRequestResponse {
    userHash: string
    state: 'Approve' | 'Existed' | 'OSSError' | 'DatabaseError' | 'FileTooLarge'
    url?: string
    uploadId?: UploadId
}

export interface ReceiveUserFileUploadedResponse {
    uploadId: number
    state:
        | 'Success'
        | 'FileHashError'
        | 'FileSizeError'
        | 'NotUploader'
        | 'ReqeustNotFound'
        | 'DatabaseError'
        | 'ObjectNotFound'
        | 'OSSError'
    url?: string
}

export interface ReceiveGetFileUrlResponse {
    hash: string
    state: 'Success' | 'FileNotExisted' | 'OSSError'
    url?: string
}

export interface ReceiveGetGroupUsersResponseData {
    state: 'Success' | 'ServerError' | 'NotGroupChat'
    chatId?: number
    inChatId?: number
    userIds?: number[]
}

export interface ReceiveQuitGroupChatResponseData {
    state: 'Success' | 'NoPermission' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    chatId?: number
}

export interface ReceiveGetGroupOwnerResponseData {
    state: 'Success' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    userId: number
    chatId: number
}

export interface ReceiveGetGroupAdminResponseData {
    state: 'Success' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    chatId: number
    userIds: number[]
}

export interface ReceiveSetGroupAdminResponseData {
    state:
        | 'Success'
        | 'NotOwner'
        | 'UserNotInChat'
        | 'AlreadyAdmin'
        | 'DatabaseError'
        | 'ServerError'
    chatId?: number
    userId?: number
}

export enum ReceiveMediaCallResponse {
    Success = 'Success',
    NotFriend = 'NotFriend',
    DatabaseError = 'DatabaseError',
}

export interface ReceiveRevokeMessageResponseData {
    state:
        | 'Success'
        | 'TimeLimitExceeded'
        | 'PermissionsDenied'
        | 'DatabaseError'
        | 'MessageNotExisted'
    chatId: number
    inChatId: number
}

export interface ReceiveRemoveGroupMemberResponseData {
    state:
        | 'Success'
        | 'SameUser'
        | 'NoPermission'
        | 'UserNotInChat'
        | 'DatabaseError'
        | 'ServerError'
    chatId?: number
    userId?: number
}

export interface ReceiveGroupOwnerTransferResponseData {
    state: 'Success' | 'DatabaseError' | 'NotOwner' | 'UserNotInChat' | 'ServerError'
    chatId: number
    userId: number
}

export interface ReceiveUpdateGroupInfoResponseData {
    state:
        | 'Success'
        | 'GroupNameFormatError'
        | 'AvaterFormatError'
        | 'NoPermission'
        | 'DatabaseError'
        | 'ServerError'
}

export interface ReceiveSetOppositeReadCursorData {
    chatId: number
    inChatId: number
}

export interface ReceiveGetUserReadInGroupResponseData {
    state: 'Success' | 'NotGroupChat' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    chatId?: number
    inChatId?: number
    userIds?: number[]
}

export interface ReceiveGetUserReadInPrivateResponseData {
    state: 'Success' | 'NotPrivateChat' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    chatId?: number
    inChatId?: number
}

export interface ReceiveGroupNoticeResponseData {
    state: 'Success' | 'NoPermission' | 'LenthLimitExceeded' | 'DatabaseError' | 'ServerError'
    chatId?: number
    clientId?: number
    noticeId?: number
    timestamp?: number
}

export interface ReceiveNotice {
    chatId: number
    noticeId: number
    senderId: number
    content: string
    timestamp: number
}

export interface ReceivePullGroupNoticeResponseData {
    state: 'Success' | 'UserNotInChat' | 'DatabaseError' | 'ServerError'
    groupNotice?: string[]
}

export interface ReceiveGetUserIDResponseData {
    state: 'Success' | 'NotFound' | 'DatabaseError' | 'ServerError'
    userIds: number[]
}

export interface ReceiveLogOffResponseData {
    state: 'Success' | 'EmailCodeError' | 'UserNotFound' | 'DatabaseError' | 'ServerError'
}

export interface ReceiveApplyForTokenResponesData {
    state: 'Success' | 'DatabaseError' | 'ServerError'
    token?: string
    timestamp?: number
}

export interface ReceiveRequestMessageData {
    reqId: number
    type: 'UserLogOff' | 'UserAlreadyInChat'
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
    UserSetting = 'UserSetting',
    SetUserSettingResponse = 'SetUserSettingResponse',
    UpdateUserInfoResponse = 'UpdateUserInfoResponse',
    UploadFileRequestResponse = 'UploadFileRequestResponse',
    FileUploadedResponse = 'FileUploadedResponse',
    GetFileUrlResponse = 'GetFileUrlResponse',
    UnfriendResponse = 'UnfriendResponse',
    DeleteChat = 'DeleteChat',
    ReadCursors = 'ReadCursors',
    SetAlreadyReadResponse = 'SetAlreadyReadResponse',
    Notice = 'Notice',
    Notices = 'Notices',
    GetGroupUsersResponse = 'GetGroupUsersResponse',
    QuitGroupChatResponse = 'QuitGroupChatResponse',
    GetGroupOwnerResponse = 'GetGroupOwnerResponse',
    GetGroupAdminResponse = 'GetGroupAdminResponse',
    SetGroupAdminResponse = 'SetGroupAdminResponse',
    MediaCallResponse = 'MediaCallResponse',
    MediaCallOffer = 'MediaCallOffer',
    MediaCallAnswer = 'MediaCallAnswer',
    MediaIceCandidate = 'MediaIceCandidate',
    MediaCallStop = 'MediaCallStop',
    RevokeMessageResponse = 'RevokeMessageResponse',
    RemoveGroupMemberResponse = 'RemoveGroupMemberResponse',
    GroupOwnerTransferResponse = 'GroupOwnerTransferResponse',
    UpdateGroupInfoResponse = 'UpdateGroupInfoResponse',
    SetOppositeReadCursor = 'SetOppositeReadCursor',
    GetUserReadInGroupResponse = 'GetUserReadInGroupResponse',
    GetUserReadInPrivateResponse = 'GetUserReadInPrivateResponse',
    GroupNoticeResponse = 'GroupNoticeResponse',
    PullGroupNoticeResponse = 'PullGroupNoticeResponse',
    GetUserIDResponse = 'GetUserIDResponse',
    LogOffResponse = 'LogOffResponse',
    ApplyForTokenResponse = 'ApplyForTokenResponse',
    RequestMessage = 'RequestMessage'
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
    token?: string
}
export interface SendSendMessageData {
    type: ChatMessageType
    clientId: number
    chatId: number
    timestamp: number
    serializedContent: string
}

export interface SendPullData {
    lastRequestId: number
    noticeTimestamp: number
}

export interface UserRequestContent {
    type: RequestContentType
    receiverId?: number
    chatId?: number
}

export interface SendUserSendRequestData {
    message: string
    content: UserRequestContent
    clientId: number
}

export interface SendSolveRequestData {
    reqId: number
    answer: 'Refused' | 'Approved'
}
export interface SendCreateGroupChatData {
    name: string
    avaterHash: string
}

export interface SendGetMessagesData {
    chatId: number
    startId: number
    endId: number
}

export interface UpdateUserName {
    type: 'UserName'
    newName: string
}
export interface UpdateAvaterPath {
    type: 'AvaterHash'
    newHash: string
}

export interface UpdatePassword {
    type: 'Password'
    newPassword: string
    emailCode: number
}

export type SendUpdateUserInfoData = UpdateUserName | UpdatePassword | UpdateAvaterPath

export interface SendSetAlreadyReadData {
    chatId: number
    inChatId: number
    private: boolean
}

export interface SendRevokeMessageData {
    chatId: number
    inChatId: number
    method: 'Sender' | 'GroupAdmin' | 'GroupOwner'
}

export interface SendSetGroupAdminData {
    chatId: number
    userId: number
}

export type MediaCallType = 'Video' | 'Voice'

export interface MediaCallData {
    friendId: number
    callType: MediaCallType
    serializedOffer: string
}

export interface MediaCallAnswerData {
    friendId: number
    accept: boolean
    serializedAnswer?: string
}

export interface MediaIceCandidate {
    friendId: number
    serializedCandidate: string
}

export type MediaCallStopReason = 'Network' | 'User'

export interface MediaCallStop {
    friendId: number
    reason: MediaCallStopReason
}

export interface SendRemoveGroupMemberData {
    chatId: number
    userId: number
}

export interface SendGroupOwnerTransferData {
    chatId: number
    userId: number
}

export interface SendSendGroupNoticeData {
    chatId: number
    notice: string
    clientId: number
}

export interface UpdateGroupInfoContent {
    type: 'GroupName' | 'Avater'
    newName?: string
    newAvater?: string
}

export interface SendUpdateGroupInfoData {
    chatId: number
    content: UpdateGroupInfoContent
}

export interface SendGetUserReadInPrivate {
    chatId: number
}

export interface SendGetUserReadInGroup {
    chatId: number
    inChatId: number
}

export interface SendPullGroupNoticeData {
    chatId: number
    lastNoticeId?: number
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
    SendRequest = 'SendRequest',
    SolveRequest = 'SolveRequest',
    CreateGroupChat = 'CreateGroupChat',
    GetMessages = 'GetMessages',
    GetChatInfo = 'GetChatInfo',
    SetUserSetting = 'SetUserSetting',
    PullUserSetting = 'PullUserSetting',
    UpdateUserInfo = 'UpdateUserInfo',
    GetFileUrl = 'GetFileUrl',
    UploadFileRequest = 'UploadFileRequest',
    FileUploaded = 'FileUploaded',
    Unfriend = 'Unfriend',
    SetAlreadyRead = 'SetAlreadyRead',
    RevokeMessage = 'RevokeMessage',
    GetGroupUsers = 'GetGroupUsers',
    QuitGroupChat = 'QuitGroupChat',
    GetGroupOwner = 'GetGroupOwner',
    GetGroupAdmin = 'GetGroupAdmin',
    SetGroupAdmin = 'SetGroupAdmin',
    MediaCall = 'MediaCall',
    MediaCallAnswer = 'MediaCallAnswer',
    MediaIceCandidate = 'MediaIceCandidate',
    MediaCallStop = 'MediaCallStop',
    RemoveGroupMember = 'RemoveGroupMember',
    GroupOwnerTransfer = 'GroupOwnerTransfer',
    SendGroupNotice = 'SendGroupNotice',
    UpdateGroupInfo = 'UpdateGroupInfo',
    GetUserReadInGroup = 'GetUserReadInGroup',
    GetUserReadInPrivate = 'GetUserReadInPrivate',
    PullGroupNotice = 'PullGroupNotice',
    GetUserID = 'GetUserID',
    LogOff = 'LogOff',
    ApplyForToken = 'ApplyForToken',
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
    [Receive.UpdateUserInfoResponse]: ReceiveUpdateUserInfoResponseData
    [Receive.UserSetting]: string
    [Receive.SetUserSettingResponse]: ReceiveSetUserSettingResponseData
    [Receive.UploadFileRequestResponse]: ReceiveUserUploadFileRequestResponse
    [Receive.FileUploadedResponse]: ReceiveUserFileUploadedResponse
    [Receive.UnfriendResponse]: ReceiveUnfriendResponseData
    [Receive.DeleteChat]: number
    [Receive.ReadCursors]: [number, number][]
    [Receive.SetAlreadyReadResponse]: ReceiveSetAlreadyReadResponseData
    [Receive.GetFileUrlResponse]: ReceiveGetFileUrlResponse
    [Receive.Notice]: string
    [Receive.Notices]: string[]
    [Receive.GetGroupUsersResponse]: ReceiveGetGroupUsersResponseData
    [Receive.QuitGroupChatResponse]: ReceiveQuitGroupChatResponseData
    [Receive.GetGroupOwnerResponse]: ReceiveGetGroupOwnerResponseData
    [Receive.GetGroupAdminResponse]: ReceiveGetGroupAdminResponseData
    [Receive.SetGroupAdminResponse]: ReceiveSetGroupAdminResponseData
    [Receive.MediaCallResponse]: ReceiveMediaCallResponse
    [Receive.MediaCallOffer]: MediaCallData
    [Receive.MediaCallAnswer]: MediaCallAnswerData
    [Receive.MediaIceCandidate]: MediaIceCandidate
    [Receive.MediaCallStop]: MediaCallStop
    [Receive.RevokeMessageResponse]: ReceiveRevokeMessageResponseData
    [Receive.RemoveGroupMemberResponse]: ReceiveRemoveGroupMemberResponseData
    [Receive.GroupOwnerTransferResponse]: ReceiveGroupOwnerTransferResponseData
    [Receive.UpdateGroupInfoResponse]: ReceiveUpdateGroupInfoResponseData
    [Receive.SetOppositeReadCursor]: ReceiveSetOppositeReadCursorData
    [Receive.GetUserReadInPrivateResponse]: ReceiveGetUserReadInPrivateResponseData
    [Receive.GetUserReadInGroupResponse]: ReceiveGetUserReadInGroupResponseData
    [Receive.GroupNoticeResponse]: ReceiveGroupNoticeResponseData
    [Receive.PullGroupNoticeResponse]: ReceivePullGroupNoticeResponseData
    [Receive.GetUserIDResponse]: ReceiveGetUserIDResponseData
    [Receive.LogOffResponse]: ReceiveLogOffResponseData
    [Receive.ApplyForTokenResponse]: ReceiveApplyForTokenResponesData
    [Receive.RequestMessage]: ReceiveRequestMessageData
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
    [Send.GetChatInfo]: ChatId
    [Send.SetUserSetting]: string
    [Send.GetFileUrl]: string
    //
    [Send.PullUserSetting]: UserId
    [Send.Unfriend]: UserId
    [Send.UpdateUserInfo]: SendUpdateUserInfoData
    [Send.UploadFileRequest]: UserUploadFileRequestData
    [Send.FileUploaded]: UploadId
    [Send.SetAlreadyRead]: SendSetAlreadyReadData
    [Send.RevokeMessage]: SendRevokeMessageData
    [Send.GetGroupUsers]: ChatId
    [Send.QuitGroupChat]: number
    [Send.GetGroupOwner]: number
    [Send.GetGroupAdmin]: number
    [Send.SetGroupAdmin]: SendSetGroupAdminData
    [Send.MediaCall]: MediaCallData
    [Send.MediaCallAnswer]: MediaCallAnswerData
    [Send.MediaIceCandidate]: MediaIceCandidate
    [Send.RemoveGroupMember]: SendRemoveGroupMemberData
    [Send.GroupOwnerTransfer]: SendGroupOwnerTransferData
    [Send.SendGroupNotice]: SendSendGroupNoticeData
    [Send.UpdateGroupInfo]: SendUpdateGroupInfoData
    [Send.GetUserReadInGroup]: SendGetUserReadInGroup
    [Send.GetUserReadInPrivate]: number
    [Send.PullGroupNotice]: SendPullGroupNoticeData
    [Send.GetUserID]: string
    [Send.LogOff]: number
    [Send.ApplyForToken]: never
    [Send.MediaCallStop]: MediaCallStop
}

// 封装消息包
export type DataType<T extends Send | Receive> = T extends Send
    ? MessageSendData[Send]
    : MessageReceiveData[Receive]

export interface MessageBody<T extends Send | Receive> {
    command: T
    data?: DataType<T>
}
