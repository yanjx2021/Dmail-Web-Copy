import localforage from 'localforage'
import { action, makeAutoObservable, observable, override, runInAction } from 'mobx'
import { UserId, authStore } from './authStore'
import {
    Receive,
    ReceiveChatMessage,
    ReceiveGetGroupUsersResponseData,
    ReceiveGetUserReadInPrivateResponseData,
    ReceiveGroupNoticeResponseData,
    ReceiveNotice,
    ReceivePullGroupNoticeResponseData,
    ReceivePullResponseData,
    ReceiveQuitGroupChatResponseData,
    ReceiveRevokeMessageResponseData,
    ReceiveSetAlreadyReadResponseData,
    ReceiveSetOppositeReadCursorData,
    ReceiveUnfriendResponseData,
    Send,
    SendMessageResponseState,
    SendSendGroupNoticeData,
    SendSendMessageData,
    SerializedReceiveChatMessage,
} from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { PullResponseState } from '../utils/message'
import { NumericLiteral } from 'typescript'
import { ReceiveSendMessageResponseData } from '../utils/message'
import { timestamp } from 'rxjs'
import { Updater } from 'use-immer'
import { LocalDatabase } from './localData'
import { User, UserStore, userStore } from './userStore'
import { timeStamp } from 'console'
import { pinyin } from 'pinyin-pro'
import { ReceiveCreateGroupChatResponse } from '../utils/message'
import { chineseOrEnglishRegex, englishRegex } from '../constants/chineseAndLetter'
import { secureAuthStore } from './secureAuthStore'
import { userSettingStore } from './userSettingStore'
import { ChatMessageContent } from '../components/ChatView/ChatViewContent'
import { UploadingFile } from './fileStore'
import { fileStore } from './fileStore'
import { FileChangeInfo } from 'fs/promises'
import { text } from 'stream/consumers'
import { Content } from 'antd/es/layout/layout'
import { serialize } from 'v8'
import {
    createGroupFromAllFriendsSelectStore,
    userSelectStore,
} from '../components/MessagesBox/Selector'
import { binaryStore } from './binaryStore'
import { modalStore } from './modalStore'
import { notificationStore } from './notificationStore'

export type ChatId = number

export type MessageId = number

export type MessageReadCursor = MessageId

type ClientId = number

export interface PrivateChatInfo {
    id: number
    users: [number, number]
}

export interface GroupChatInfo {
    id: number
    name: string
    avaterHash: string
}

export type ChatInfo = PrivateChatInfo | GroupChatInfo

export enum ChatMessageState {
    Sending = '发送中...',
    Getting = '拉取中...',
    Arrived = '已送达',
}

export enum ChatMessageType {
    File = 'File',
    Text = 'Text',
    Image = 'Image',
    Deleted = 'Deleted',
    Voice = 'Voice',
    Transfer = 'Transfer',
    Revoked = 'Revoked',
    MentionText = 'MentionText',
    ReplyText = 'ReplyText',
}

export type ChatMessageContentType =
    | string
    | ChatMessageFileInfo
    | ImageHash
    | ChatMessageTransferInfo
    | MentionTextContent
    | ReplyTextContent

export interface ReplyTextContent {
    inChatId: number
    text: string
}

export interface MentionTextContent {
    userIds: number[]
    text: string
}

export interface ChatMessageTransferInfo {
    userId: number
    messages: SerializedReceiveChatMessage[]
}

export interface ChatMessageFileInfo {
    hash: string
    name: string
    size: number
}

export enum ChatType {
    Private,
    Group,
    Unknown,
}

export type ImageHash = string

export class ChatMessage {
    chatId: number
    type: ChatMessageType
    content: ChatMessageContentType
    timestamp: number
    inChatId?: ChatId
    senderId: UserId
    state: ChatMessageState
    clientId?: ClientId
    bindChat: Chat

    bindUploading?: UploadingFile

    translatedText?: string

    get showRevokeButton() {
        // 系统消息
        if (this.senderId === 0) return false
        // 自己发送的消息
        if (this.senderId === authStore.userId) return true
        // 是群主
        if (this.bindChat.ownerId === authStore.userId) return true
        // 是管理员并且不是群主发的消息
        if (this.bindChat.isAdmin(authStore.userId) && !this.bindChat.isAdmin(this.senderId))
            return true
        return false
    }

    get showReplyButton() {
        if (this.senderId === 0) return false
        if (this.senderId === authStore.userId) return false
        if (this.type === ChatMessageType.Revoked) return false
        return true
    }

    get showGetReadersButton() {
        return this.bindChat.chatType === ChatType.Group
    }

    get revokeMethod(): 'Sender' | 'GroupAdmin' | 'GroupOwner' {
        const chat = chatStore.getChat(this.chatId)
        if (chat.chatType === ChatType.Private) {
            return 'Sender'
        }
        if (chat.chatType === ChatType.Group) {
            if (chat.ownerId === authStore.userId) {
                return 'GroupOwner'
            }
            if (chat.isAdmin(authStore.userId)) {
                return 'GroupAdmin'
            }
            return 'Sender'
        }
        return 'Sender'
    }



    revokeMessage() {
        MessageServer.Instance().send<Send.RevokeMessage>(Send.RevokeMessage, {
            chatId: this.chatId,
            inChatId: this.inChatId!,
            method: this.revokeMethod,
        })
    }

    getGroupReaders() {
        if (this.bindChat.chatType !== ChatType.Group || !this.inChatId) {
            return
        }
        chatStore.getGroupMessageReadersToken = [this.chatId, this.inChatId]
        MessageServer.Instance().send<Send.GetUserReadInGroup>(Send.GetUserReadInGroup, {
            chatId: this.chatId,
            inChatId: this.inChatId,
        })
    }

    static getLoadingMessage(inChatId: ChatId, chatId: ChatId) {
        return new ChatMessage({
            type: ChatMessageType.Text,
            content: `消息${inChatId}`,
            inChatId: inChatId,
            timestamp: 0,
            senderId: 0,
            state: ChatMessageState.Getting,
            chatId: chatId,
        })
    }

    static createFromReciveMessage(receiveMessage: ReceiveChatMessage) {
        return new ChatMessage({
            type: receiveMessage.type,
            content: JSON.parse(receiveMessage.serializedContent),
            timestamp: receiveMessage.timestamp,
            inChatId: receiveMessage.inChatId,
            senderId: receiveMessage.senderId,
            state: ChatMessageState.Arrived,
            chatId: receiveMessage.chatId,
        })
    }

    serialized(): SerializedReceiveChatMessage {
        const receiveMessage: ReceiveChatMessage = {
            type: this.type,
            chatId: this.chatId,
            senderId: this.senderId,
            inChatId: this.inChatId!,
            timestamp: this.timestamp,
            serializedContent: JSON.stringify(this.content),
        }
        return JSON.stringify(receiveMessage)
    }

    constructor({
        type,
        content,
        timestamp,
        inChatId,
        senderId,
        state,
        chatId,
    }: {
        type: ChatMessageType
        content: ChatMessageContentType
        timestamp: number
        inChatId: MessageId | undefined
        senderId: UserId
        state: ChatMessageState
        chatId: number
    }) {
        makeAutoObservable(this, { inChatId: observable.ref })
        this.type = type
        this.content = content
        this.timestamp = timestamp
        this.inChatId = inChatId
        this.senderId = senderId
        this.state = state
        this.chatId = chatId
        this.bindChat = chatStore.getChat(chatId)
    }

    get alreadyRead() {
        if (this.bindChat.chatType === ChatType.Private && this.inChatId) {
            return this.bindChat.oppositeReadCursor! >= this.inChatId
        }
        return false
    }

    get getMessageBoxTip() {
        let tip = ''
        if (this.senderId === 0) {
            tip += '系统消息'
        } else {
            tip += userStore.getUser(this.senderId).showName
            tip += ' ' + new Date(this.timestamp).toLocaleString()
        }
        return tip
    }

    get getMessageTip() {
        let tip = ''
        if (this.senderId === 0) {
            tip += '系统消息'
        } else {
            tip += userStore.getUser(this.senderId).showName
            tip += ' ' + new Date(this.timestamp).toLocaleString()
        }

        tip += ' ' + this.state

        if (this.bindChat.chatType === ChatType.Private && this.senderId === authStore.userId) {
            if (this.alreadyRead) {
                tip += ' 已读'
            } else {
                tip += ' 未读'
            }
        }

        return tip
    }
    get asShort() {
        switch (this.type) {
            case ChatMessageType.Text:
                return this.content as string
            case ChatMessageType.Deleted:
                return '[已删除]'
            case ChatMessageType.Revoked:
                return '[已撤回]'
            case ChatMessageType.Transfer:
                return '[聊天记录]'
            case ChatMessageType.File:
                return '[文件消息]'
            case ChatMessageType.Image:
                return '[图片消息]'
            case ChatMessageType.Voice:
                return '[语音消息]'
            case ChatMessageType.ReplyText:
                const replyContent = this.content as ReplyTextContent
                return replyContent.text
            case ChatMessageType.MentionText:
                const mentionContent = this.content as MentionTextContent
                return mentionContent.text
            default:
                return '当前版本尚不支持该消息'
        }
    }

    setToSelf(msg: ChatMessage) {
        this.content = msg.content
        this.timestamp = msg.timestamp
        this.inChatId = msg.inChatId
        this.senderId = msg.senderId
        this.state = msg.state
        this.content = msg.content
        this.type = this.type === ChatMessageType.Deleted ? ChatMessageType.Deleted : msg.type
        this.chatId = msg.chatId
        this.bindChat = msg.bindChat
    }

    deleteLocal(indexInView?: number) {
        this.content = ''
        this.type = ChatMessageType.Deleted
        LocalDatabase.saveMessage(this)

        if (chatStore.setViewMessages && indexInView && chatStore.activeChatId === this.chatId) {
            chatStore.setViewMessages((draft) => {
                draft.splice(indexInView, 1)
            })
        }
    }
}

export class GroupChatNotice {
    chatId: number
    noticeId: number | undefined
    notice: string
    timestamp: number
    senderId: number
    clientId?: number

    constructor({
        chatId,
        notice,
        noticeId,
        timestamp,
        senderId
    }: {
        chatId: number
        noticeId: number | undefined
        notice: string
        timestamp: number
        senderId: number
    }) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.chatId = chatId
        this.noticeId = noticeId
        this.notice = notice
        this.timestamp = timestamp
        this.senderId = senderId
    }

    setToSelf(another: GroupChatNotice) {
        this.chatId = another.chatId
        this.notice = another.notice
        this.noticeId = another.noticeId
        this.timestamp = another.timestamp
        this.clientId = another.clientId
        this.senderId = another.senderId
    }

    static createFromReceiveNotice(receiveNotice: ReceiveNotice) {
        return new GroupChatNotice({
            chatId: receiveNotice.chatId,
            noticeId: receiveNotice.noticeId,
            notice: receiveNotice.content,
            timestamp: receiveNotice.timestamp,
            senderId: receiveNotice.senderId,
        })
    }
}

export class Chat {
    messages: Map<MessageId, ChatMessage> = new Map()
    private sendingMessages: ChatMessage[] = []

    private lastClientId: number = 0

    errors = ''

    chatId: ChatId = 0
    chatType: ChatType = ChatType.Unknown
    lastMessage: ChatMessage | undefined = undefined
    selfReadCursor: number = 0

    // 私聊部分
    bindUser: User | null = null
    oppositeReadCursor: number | null = null

    // 群聊部分
    ownerId: number | null = null
    adminIds: number[] | null = null
    userIds: number[] | null = null
    groupName: string | null = null
    groupAvaterPath: string | null = null
    atYou: boolean = false
    notices: Map<number, GroupChatNotice> = new Map()
    sendingNotices: GroupChatNotice[] = []

    private lastNoticeClientId: number = 0

    constructor(chatId: number) {
        this.chatId = chatId
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get getAvaterUrl() {
        if (this.avaterHash && this.avaterHash !== '')
            return binaryStore.getBinaryUrl(this.avaterHash).url
        return 'assets/images/user.png'
    }

    get noticeList() {
        const list: GroupChatNotice[] = []
        this.notices.forEach((notice, _) => {
            list.push(notice)
        })
        return list
    }

    get mentionUserList() {
        if (this.chatType === ChatType.Private) return []
        if (!this.userIds) return []
        const mentionOptionList = this.userIds.map((userId) => {
            return {
                value: `${userStore.getUser(userId).originName}(${userId})`,
                label: `${userStore.getUser(userId).originName} (ID: ${userId})`,
                key: userId.toString(),
            }
        })
        return mentionOptionList
    }

    get avaterHash() {
        if (this.chatType === ChatType.Private) return this.bindUser!.avaterHash
        return this.groupAvaterPath
    }

    setGroupAvater(avaterHash: string) {
        this.groupAvaterPath = avaterHash
    }

    setGroupName(newName: string) {
        this.groupName = newName
    }

    GetNotices(lastNoticeId: number = 0) {
        MessageServer.Instance().send<Send.PullGroupNotice>(Send.PullGroupNotice, {
            lastNoticeId,
            chatId: this.chatId
        })
    }

    messagesList() {
        const messageList: ChatMessage[] = []
        this.messages.forEach((message) => messageList.push(message))
        messageList.sort((a, b) => a.timestamp - b.timestamp)
        return messageList
    }

    removeGroupChatMember(userId: number) {
        this.userIds &&
            this.userIds.indexOf(userId) > -1 &&
            this.userIds.splice(this.userIds.indexOf(userId), 1)
        this.adminIds &&
            this.adminIds.indexOf(userId) > -1 &&
            this.adminIds.splice(this.adminIds.indexOf(userId), 1)
        userId === this.ownerId && console.log('真的要踢出群主吗')
    }

    setGroupChatUserIds(userIds: number[]) {
        this.userIds = userIds
    }

    isAdmin(userId: number) {
        return this.adminIds && this.adminIds.indexOf(userId) > -1
    }

    setGroupChatOwnerId(userId: number) {
        this.ownerId = userId
    }
    addGroupChatAdminId(userId: number) {
        this.adminIds && this.adminIds.indexOf(userId) === -1 && this.adminIds.push(userId)
    }
    setGroupChatAdminIds(userIds: number[]) {
        this.adminIds = userIds
    }

    pullOppositeReadCursor() {
        MessageServer.Instance().send<Send.GetUserReadInPrivate>(
            Send.GetUserReadInPrivate,
            this.chatId
        )
    }

    static getLoadingChat(chatId: ChatId) {
        return new Chat(chatId)
    }

    get sidebarTitle() {
        if (this.chatType === ChatType.Private) return '用户信息'
        return '群聊信息'
    }

    setReadCuser() {
        let lastMsgId = 0
        if (this.lastMessage !== undefined && this.lastMessage.inChatId) {
            lastMsgId = this.lastMessage.inChatId
        }

        if (lastMsgId > this.selfReadCursor) {
            this.selfReadCursor = lastMsgId
            MessageServer.Instance().send<Send.SetAlreadyRead>(Send.SetAlreadyRead, {
                chatId: this.chatId,
                inChatId: lastMsgId,
                private: this.chatType === ChatType.Private,
            })
        }
    }

    get sidebarName() {
        if (this.chatType === ChatType.Unknown) {
            return `群聊${this.chatId}`
        } else if (this.chatType === ChatType.Private) {
            return this.bindUser!.originName
        }
        return this.groupName!
    }

    get unreadMessageCount() {
        if (this.lastMessage === undefined) {
            return 0
        }
        return this.lastMessage.inChatId! - this.selfReadCursor
    }

    get name() {
        if (this.chatType === ChatType.Unknown) {
            return `群聊${this.chatId}`
        } else if (this.chatType === ChatType.Private) {
            return this.bindUser!.showName
        }
        return this.groupName!
    }

    get unreadCount() {
        return this.lastMessage === undefined ? 0 : this.lastMessage.inChatId! - this.selfReadCursor
    }

    setChatInfo(info: ChatInfo) {
        if ('name' in info) {
            // 群聊
            this.groupName = info.name
            this.groupAvaterPath = info.avaterHash
            this.chatType = ChatType.Group
            this.userIds = []
        } else {
            // 私聊
            const users: [number, number] = info.users
            const otherId = users[0] === authStore.userId ? users[1] : users[0]
            this.bindUser = userStore.getUser(otherId)
            this.chatType = ChatType.Private
        }
        LocalDatabase.saveChatInfo(this.chatId, info)
    }

    setNotice(notice: GroupChatNotice) {
        const notice_opt = this.notices.get(notice.noticeId!)
        let updated_notice = undefined
        if (notice_opt === undefined) {
            this.notices.set(notice.noticeId!, notice)
            updated_notice = notice
        } else {
            updated_notice = notice_opt!
            updated_notice.setToSelf(notice)
        }
    }

    async setMessage(msg: ChatMessage) {
        const message_opt = this.messages.get(msg.inChatId!)
        let updated_msg = undefined

        if (message_opt === undefined) {
            this.messages.set(msg.inChatId!, msg)
            updated_msg = msg
        } else {
            updated_msg = message_opt!
            updated_msg.setToSelf(msg)
        }

        LocalDatabase.saveMessage(msg)

        if (this.lastMessage === undefined || updated_msg.inChatId! > this.lastMessage.inChatId!) {
            this.lastMessage = updated_msg
            if (this.chatId === chatStore.activeChatId && !secureAuthStore.showSecureBox) {
                this.setReadCuser()
            }
        }
    }

    // TODO : 单独拉取数据
    // getMessage(inChatId: MessageId) {
    //     if (this.messages.has(inChatId)) {
    //         return this.messages.get(inChatId)!
    //     }
    //     const msg = ChatMessage.getLoadingMessage(inChatId, this.chatId)
    //     this.messages.set(inChatId, msg)
    //     // TODO : 从本地数据库拉取数据

    //     return msg
    // }

    async getMessages(endId: MessageId, count: number) {
        const startId = Math.max(endId - count + 1, 1)
        endId = this.lastMessage === undefined ? 0 : Math.min(endId, this.lastMessage.inChatId!)

        if (endId < startId) {
            return []
        }

        const msgs: ChatMessage[] = []

        const unknown: number[] = []
        const promises = []

        for (let i = startId; i <= endId; i++) {
            const msgInMemory = this.messages.get(i)

            if (msgInMemory) {
                msgInMemory.type !== ChatMessageType.Deleted && msgs.push(msgInMemory)
            } else {
                const promise = LocalDatabase.loadMessageLocal(this.chatId, i)
                    .then(
                        action((messageLocal) => {
                            let chatMsg = undefined

                            if (messageLocal === null) {
                                unknown.push(i)
                                chatMsg = ChatMessage.getLoadingMessage(i, this.chatId)
                            } else {
                                chatMsg = ChatMessage.createFromReciveMessage(messageLocal)
                            }

                            this.setMessage(chatMsg)
                            chatMsg.type !== ChatMessageType.Deleted && msgs.push(chatMsg)
                        })
                    )
                    .catch((err) => {
                        console.log('localForage错误 ' + err)
                    })

                promises.push(promise)
            }
        }

        await Promise.all(promises)

        if (unknown.length === 0) {
            return msgs.sort(action((a, b) => a.inChatId! - b.inChatId!))
        }

        // TODO : 根据unknow选择不同的加载策略
        if (unknown.length < 4) {
            // 逐个
        } else {
            // 合批
        }

        const getEndId = Math.max(...unknown)
        const getStartId = Math.min(...unknown)

        runInAction(() => {
            MessageServer.Instance().send<Send.GetMessages>(Send.GetMessages, {
                startId: getStartId,
                endId: getEndId,
                chatId: this.chatId,
            })
        })

        return msgs.sort(action((a, b) => a.inChatId! - b.inChatId!))
    }

    sendFileMessage(
        type: ChatMessageType,
        file: File,
        contentProducer: (hash: string, file: File) => any
    ) {
        const timestamp = Date.now()
        let msg = new ChatMessage({
            type,
            content: '',
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId,
        })
        msg.clientId = ++this.lastClientId

        const sendingMessages = this.sendingMessages
        const chatId = this.chatId

        const uploading = fileStore.requestUpload(
            file,
            action((uploading: UploadingFile) => {
                const content = contentProducer(uploading.hash!, file)

                const data: SendSendMessageData = {
                    type,
                    clientId: msg.clientId!,
                    serializedContent: JSON.stringify(content),
                    chatId: chatId,
                    timestamp,
                }

                sendingMessages.push(msg)
                MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)

                msg.bindUploading = undefined
                msg.content = content
            })
        )

        msg.bindUploading = uploading
        return msg
    }

    sendTransferMessage(msgs: ChatMessage[]) {
        const timestamp = Date.now()
        const content = msgs.map((msg, _) => {
            return msg.serialized()
        })
        const data: SendSendMessageData = {
            type: ChatMessageType.Transfer,
            clientId: ++this.lastClientId,
            serializedContent: JSON.stringify({
                userId: authStore.userId,
                messages: content,
            }),
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            type: ChatMessageType.Transfer,
            content: {
                userId: authStore.userId,
                messages: content,
            },
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId,
        })
        msg.clientId = data.clientId
        // TODO : Response超时
        this.sendingMessages.push(msg)
        MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)
        return msg
    }

    sendReplyMessage(text: string, replyId: number) {
        const timestamp = Date.now()
        const data: SendSendMessageData = {
            type: ChatMessageType.ReplyText,
            clientId: ++this.lastClientId,
            serializedContent: JSON.stringify({
                text,
                inChatId: replyId
            }),
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            type: ChatMessageType.ReplyText,
            content: {
                text,
                inChatId: replyId,
            },
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId,
        })
        msg.clientId = data.clientId

        // TODO : Response超时
        this.sendingMessages.push(msg)
        MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)
        return msg
    }

    sendMentionMessage(text: string, userIds: number[]) {
        const timestamp = Date.now()
        const data: SendSendMessageData = {
            type: ChatMessageType.MentionText,
            clientId: ++this.lastClientId,
            serializedContent: JSON.stringify({
                text,
                userIds,
            }),
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            type: ChatMessageType.MentionText,
            content: {
                text,
                userIds,
            },
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId,
        })
        msg.clientId = data.clientId

        // TODO : Response超时
        this.sendingMessages.push(msg)
        MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)
        return msg
    }

    sendGroupChatNotice(notice: string) {
        if (this.chatType === ChatType.Private) {
            console.log('是私聊，无法发送公告')
            return
        }
        const timestamp = Date.now()
        const sendData: SendSendGroupNoticeData = {
            chatId: this.chatId,
            clientId: ++this.lastNoticeClientId,
            notice: notice,
        }
        let sendNotice = new GroupChatNotice({
            timestamp: timestamp,
            noticeId: undefined,
            chatId: this.chatId,
            notice: notice,
            senderId: authStore.userId
        })
        sendNotice.clientId = sendData.clientId
        this.sendingNotices.push(sendNotice)
        MessageServer.Instance().send<Send.SendGroupNotice>(Send.SendGroupNotice, sendData)
        return sendNotice
    }

    sendTextMessage(text: string) {
        const timestamp = Date.now()
        const data: SendSendMessageData = {
            type: ChatMessageType.Text,
            clientId: ++this.lastClientId,
            serializedContent: JSON.stringify(text),
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            type: ChatMessageType.Text,
            content: text,
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId,
        })
        msg.clientId = data.clientId

        // TODO : Response超时
        this.sendingMessages.push(msg)
        MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)
        return msg
    }

    handleSendGroupNoticeResponse(response: ReceiveGroupNoticeResponseData) {
        const notice = this.sendingNotices.find((notice) => notice.clientId === response.clientId)
        if (notice === undefined) {
            return
        }
        this.sendingNotices.splice(this.sendingNotices.indexOf(notice), 1)
        if (response.state !== 'Success') {
            this.errors = '发送群公告失败'
            return
        }
        notice.noticeId = response.noticeId!
        notice.timestamp = response.timestamp!
        this.setNotice(notice)
    }

    handleSendMessageResponse(
        response: ReceiveSendMessageResponseData,
        setViewMessages: undefined | Updater<ChatMessage[]>
    ) {
        const chatMsg = this.sendingMessages.find((value) => value.clientId === response.clientId)
        if (chatMsg === undefined) {
            console.error('收到了未经处理的SendMessageResponse')
            return
        }
        const index = this.sendingMessages.indexOf(chatMsg)
        this.sendingMessages.splice(index, 1)

        if (response.state !== SendMessageResponseState.Success) {
            console.error(response.state)
            return
        }
        chatMsg.timestamp = response.timestamp!
        chatMsg.inChatId = response.inChatId
        chatMsg.state = ChatMessageState.Arrived
        this.setMessage(chatMsg)
    }
}

export class ChatStore {
    private chats: Map<ChatId, Chat> = new Map()

    topChatIds: number[] = []

    activeChatId: undefined | ChatId = undefined
    setViewMessages: undefined | Updater<ChatMessage[]> = undefined
    setActiveChatId: undefined | React.Dispatch<React.SetStateAction<number | null>> = undefined

    // [chatId, inChatId]
    getGroupMessageReadersToken: [number, number] | undefined = undefined

    errors: string = ''

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.PullResponse, this.ReceivePullResponseHandler)
        MessageServer.on(Receive.Message, this.ReceiveMessageHandler)
        MessageServer.on(Receive.SendMessageResponse, this.ReceiveSendMessageResponseHandler)
        MessageServer.on(Receive.Messages, this.ReceiveMessagesHandler)
        MessageServer.on(Receive.Chat, this.ReceiveChatInfoHandler)
        MessageServer.on(
            Receive.CreateGroupChatResponse,
            this.ReceiveCreateGroupChatResponseHandler
        )
        MessageServer.on(Receive.UnfriendResponse, this.UnfriendResponseHandler)
        MessageServer.on(Receive.DeleteChat, this.DeleteChatHandler)
        MessageServer.on(Receive.ReadCursors, this.ReadCusersHandler)
        MessageServer.on(Receive.SetAlreadyReadResponse, this.SetAlreadyReadResponseHandler)
        MessageServer.on(Receive.QuitGroupChatResponse, this.QuitGroupResponseHandler)
        MessageServer.on(Receive.RevokeMessageResponse, this.RevokeMessageResponseHandler)
        MessageServer.on(
            Receive.GetUserReadInPrivateResponse,
            this.ReceiveGetUserReadInPrivateResponseHandler
        )
        MessageServer.on(Receive.SetOppositeReadCursor, this.ReceiveSetOppositeReadCursor)
        MessageServer.on(Receive.GetUserReadInGroupResponse, this.ReceiveGetUserReadInGroupResponse)
        MessageServer.on(Receive.GroupNoticeResponse, this.GroupNoticeResponseHandler)
        MessageServer.on(Receive.PullGroupNoticeResponse, this.PullGroupNoticeResponseHandler)
    }

    reset() {
        this.chats.clear()
        this.setViewMessages = undefined
        this.setActiveChatId = undefined
        this.activeChatId = undefined
        this.topChatIds = []
        this.errors = ''
    }

    get friendMap() {
        const friendMap = new Map<number, undefined>()
        this.chats.forEach((chat, _) => {
            if (chat.chatType === ChatType.Private) {
                friendMap.set(chat.bindUser!.userId, undefined)
            }
        })
        return friendMap
    }

    userToChat(userId: number) {
        let result: any
        this.chats.forEach((chat, chatId) => {
            if (chat.bindUser && chat.bindUser.userId === userId) {
                result = chatId
            }
        })
        return result
    }

    get privateChatGroup() {
        const chats: Chat[] = []
        const nonChineseChats: Chat[] = []
        let groupCounts: number[] = Array(27).fill(0)
        const groups: string[] = []
        const firstLetter = (chat: Chat) => {
            if (englishRegex.test(chat.name[0])) return chat.name[0].toLowerCase()
            return pinyin(chat.name[0].toLowerCase(), { pattern: 'initial', toneType: 'none' })
        }

        this.chats.forEach((chat, _) => {
            if (chat.chatType === ChatType.Private) {
                if (chineseOrEnglishRegex.test(chat.name[0])) {
                    chats.push(chat)
                } else {
                    groupCounts[26]++
                    nonChineseChats.push(chat)
                }
            }
        })
        chats.sort((a, b) => {
            if (firstLetter(a) > firstLetter(b)) return 1
            else return -1
        })
        chats.forEach((chat, _) => {
            const index = firstLetter(chat).toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)
            if (groupCounts[index] === 0) {
                // 首次计算
                groups.push(firstLetter(chat).toUpperCase())
            }
            groupCounts[index]++
        })
        // 在chat最后添加非中文和英文开头的聊天
        nonChineseChats.forEach((chat, _) => chats.push(chat))
        groups.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
        //为特殊字符添加编号#
        groupCounts[26] !== 0 && groups.push('#')
        groupCounts = groupCounts.filter((value, _) => value !== 0)

        return {
            chats: chats,
            groups: groups,
            groupCounts: groupCounts,
        }
    }

    isTopChat(chatId: number) {
        return this.topChatIds.indexOf(chatId) > -1
    }

    addTopChat(chatId: number) {
        if (this.topChatIds.indexOf(chatId) === -1) {
            this.topChatIds.push(chatId)
            userSettingStore.setTop(this.topChatIds)
        }
    }

    removeTopChat(chatId: number) {
        if (this.topChatIds.indexOf(chatId) > -1) {
            this.topChatIds.splice(this.topChatIds.indexOf(chatId), 1)
            userSettingStore.setTop(this.topChatIds)
        }
    }

    get topChats() {
        const topChats: Chat[] = []
        this.topChatIds.forEach(action((chatId, _) => {
            topChats.push(this.getChat(chatId))
        }))
        return topChats
    }

    get recentChatsView() {
        // 1.数据有序
        // 2.timestamp在一定范围

        // TODO : listView使用二叉树维护
        // O(nlogn + rank) => O(rank+logn)
        if (this.topChats.length !== 0) {
            const chatArray: Chat[] = []
            this.chats.forEach((chat) => {
                if (chat.lastMessage !== undefined && this.topChatIds.indexOf(chat.chatId) === -1) {
                    chatArray.push(chat)
                }
            })
            this.topChats.sort((a, b) => {
                if (!a.lastMessage || !b.lastMessage) return 1
                return b.lastMessage!.timestamp - a.lastMessage!.timestamp
            })
            chatArray.sort((a, b) => b.lastMessage!.timestamp - a.lastMessage!.timestamp)
            return this.topChats.concat(chatArray)
        }

        const chatArray: Chat[] = []
        this.chats.forEach((chat) => {
            if (chat.lastMessage !== undefined) {
                chatArray.push(chat)
            }
        })

        chatArray.sort((a, b) => b.lastMessage!.timestamp - a.lastMessage!.timestamp)
        return chatArray
    }

    // get allChatsView() {
    // assigned to lzy
    // O(n)
    // }

    setChatInfo(info: ChatInfo) {
        // TODO : More Typescript

        this.getChat(info.id).setChatInfo(info)
    }

    getChat(chatId: ChatId) {
        const chat = this.chats.get(chatId)
        if (chat === undefined) {
            this.chats.set(chatId, Chat.getLoadingChat(chatId))
            LocalDatabase.loadChatInfo(chatId)
            return this.chats.get(chatId)!
        } else {
            return chat
        }
    }

    private SetAlreadyReadResponseHandler(response: ReceiveSetAlreadyReadResponseData) {
        console.log(response.state)
    }

    private ReadCusersHandler(cusers: [number, number][]) {
        cusers.forEach(([chatId, cuser]) => {
            this.getChat(chatId)
            this.chats.get(chatId)!.selfReadCursor = cuser
        })
    }

    private removeChatInfo(chat: Chat) {
        chatStore.setActiveChatId && chatStore.setActiveChatId(null)
        userSettingStore.setChatVerify(chat.chatId, '')
        chat.bindUser && userSettingStore.setUserNickName(chat.bindUser.userId, '')
        for (let inChatId = 1; inChatId <= chat.lastMessage!.inChatId!; inChatId++) {
            // 清除聊天记录
            LocalDatabase.removeMessage(chat.chatId, inChatId).catch((err) => console.log(err))
        }
        LocalDatabase.removeChatInfo(chat.chatId)
        this.chats.delete(chat.chatId)
    }
    
    private DeleteChatHandler(chatId: number) {
        if (!this.chats.has(chatId)) {
            this.errors = `清除聊天失败，聊天${chatId}不存在`
            return
        }
        const chat = this.chats.get(chatId)!
        if (chat.chatType === ChatType.Private) {
            // 删除私聊
            LocalDatabase.removeUserInfo(chat.bindUser!.userId).catch((err) => console.log(err)) // 清除用户
            chatStore.removeTopChat(chat.chatId)
            notificationStore.unMuteChat(chat.chatId)
        }
        this.removeChatInfo(chat)
    }

    private QuitGroupResponseHandler(response: ReceiveQuitGroupChatResponseData) {
        switch (response.state) {
            case 'Success':
                if (!this.chats.has(response.chatId!)) {
                    this.errors = `找不到聊天，聊天${response.chatId}不存在`
                    return
                } else {
                    const chat = this.chats.get(response.chatId!)!
                    if (chat.chatType === ChatType.Private) {
                        this.errors = `聊天属性异常：聊天${response.chatId}属性为私聊`
                        return
                    }
                    this.removeChatInfo(chat)
                }
                return
            case 'DatabaseError':
                this.errors = '数据库异常'
                return
            case 'NoPermission':
                this.errors = '群主不能退出群聊'
                return
            case 'UserNotInChat':
                this.errors = '用户不在群聊中'
                return
            case 'ServerError':
                this.errors = '服务器异常'
                return
            default:
                this.errors = '未知错误'
                return
        }
    }

    private UnfriendResponseHandler(response: ReceiveUnfriendResponseData) {
        switch (response.state) {
            case 'Success':
                if (!this.chats.has(response.chatId!)) {
                    this.errors = `清除聊天失败，聊天${response.chatId!}不存在`
                    return
                }
                // 清理缓存
                const chat = this.chats.get(response.chatId!)!
                LocalDatabase.removeUserInfo(chat.bindUser!.userId).catch((err) => console.log(err)) // 清除用户
                notificationStore.unMuteChat(chat.chatId)
                chatStore.removeTopChat(chat.chatId)
                this.removeChatInfo(chat)
                console.log('成功删除好友')
                break
            case 'ServerError':
                this.errors = '服务器异常，请稍后再试'
                break
            default:
                this.errors = '未知的错误'
        }
    }

    private ReceiveSendMessageResponseHandler(response: ReceiveSendMessageResponseData) {
        this.getChat(response.chatId).handleSendMessageResponse(
            response,
            response.chatId === this.activeChatId ? this.setViewMessages : undefined
        )
    }

    private PullGroupNoticeResponseHandler(response: ReceivePullGroupNoticeResponseData) {
        if (response.state !== 'Success') {
            this.errors = '拉取群公告失败'
            console.error(response)
            return
        }
        response.groupNotice!.forEach((serializedNotice, _) => {
            const notice: ReceiveNotice = JSON.parse(serializedNotice)
            chatStore.getChat(notice.chatId).setNotice(GroupChatNotice.createFromReceiveNotice(notice))
        })
    }

    private RevokeMessageResponseHandler(response: ReceiveRevokeMessageResponseData) {
        switch (response.state) {
            case 'Success':
                //TODO revoke
                break
            case 'PermissionsDenied':
                this.errors = '无权撤回'
                break
            case 'TimeLimitExceeded':
                this.errors = '超时，无法撤回'
                break
            default:
                console.log('懒得处理了')
                break
        }
    }

    private ReceiveMessageHandler(serialized: SerializedReceiveChatMessage) {
        const receiveMessage: ReceiveChatMessage = JSON.parse(serialized)

        const chat = this.getChat(receiveMessage.chatId)

        const msg = ChatMessage.createFromReciveMessage(receiveMessage)

        if (receiveMessage.chatId === this.activeChatId && this.setViewMessages) {
            this.setViewMessages((draft) => {
                draft.push(msg)
            })
        }

        chat.setMessage(msg)
    }

    private ReceiveMessagesHandler(serializeds: SerializedReceiveChatMessage[]) {
        let chat: Chat | undefined = undefined
        for (let i = 0; i < serializeds.length; i++) {
            const receiveMessage: ReceiveChatMessage = JSON.parse(serializeds[i])

            if (chat === undefined || chat!.chatId !== receiveMessage.chatId) {
                chat = this.getChat(receiveMessage.chatId)
            }

            const msg = ChatMessage.createFromReciveMessage(receiveMessage)

            chat.setMessage(msg)
        }
    }

    private ReceivePullResponseHandler(data: ReceivePullResponseData) {}

    private ReceiveChatInfoHandler(data: SerializedReceiveChatMessage) {
        const chatInfo = JSON.parse(data)
        this.setChatInfo(chatInfo)
        LocalDatabase.saveChatInfo(chatInfo.id, chatInfo)
    }

    private ReceiveCreateGroupChatResponseHandler(data: ReceiveCreateGroupChatResponse) {
        if (data.state === 'DatabaseError') {
            this.errors = '数据库异常，请稍后再试'
            return
        } else {
            this.getChat(data.chatId!)
            if (!createGroupFromAllFriendsSelectStore.isEmpty) {
                createGroupFromAllFriendsSelectStore.inviteUsers(data.chatId!)
            }
            if (!userSelectStore.isEmpty) {
                this.activeChatId &&
                    this.getChat(this.activeChatId).chatType === ChatType.Private &&
                    userSelectStore.checkUser(this.getChat(this.activeChatId).bindUser!)
                userSelectStore.inviteUsers(data.chatId!)
            }
        }
    }

    private GroupNoticeResponseHandler(response: ReceiveGroupNoticeResponseData) {
        if (response.state !== 'Success') {
            this.errors = '发布群公告失败'
            return
        }
        //TODO: 分发
        this.getChat(response.chatId!).handleSendGroupNoticeResponse(response)
    }

    private ReceiveGetUserReadInPrivateResponseHandler(
        data: ReceiveGetUserReadInPrivateResponseData
    ) {
        if (data.state !== 'Success') {
            this.errors = '拉取私聊ReadCursor错误'
            return
        }

        this.getChat(data.chatId!).oppositeReadCursor = data.inChatId!
    }

    private ReceiveSetOppositeReadCursor(data: ReceiveSetOppositeReadCursorData) {
        this.getChat(data.chatId!).oppositeReadCursor = data.inChatId!
    }

    private ReceiveGetUserReadInGroupResponse(data: ReceiveGetGroupUsersResponseData) {
        if (data.state !== 'Success') {
            this.errors = '拉取群聊Readers错误'
            return
        }
        if (
            !this.getGroupMessageReadersToken ||
            this.getGroupMessageReadersToken[0] !== data.chatId! ||
            this.getGroupMessageReadersToken[1] !== data.inChatId!
        ) {
            return
        }
        modalStore.groupMessageReaders = data.userIds!
    }
}

export const chatStore = new ChatStore()
