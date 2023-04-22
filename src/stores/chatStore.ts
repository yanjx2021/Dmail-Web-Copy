import localforage from 'localforage'
import { action, makeAutoObservable, observable, override, runInAction } from 'mobx'
import { UserId, authStore } from './authStore'
import {
    Receive,
    ReceiveChatMessage,
    ReceivePullResponseData,
    ReceiveSetAlreadyReadResponseData,
    ReceiveUnfriendResponseData,
    Send,
    SendMessageResponseState,
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
import { chineseRegex } from '../constants/chineseAndLetter'
import { secureAuthStore } from './secureAuthStore'
import { userSettingStore } from './userSettingStore'
import { ChatMessageContent } from '../components/ChatView/ChatViewContent'
import { UploadingFile } from './fileStore'
import { fileStore } from './fileStore'
import { FileChangeInfo } from 'fs/promises'
import { text } from 'stream/consumers'
import { Content } from 'antd/es/layout/layout'

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
    avaterPath: string
}

export type ChatInfo = PrivateChatInfo | GroupChatInfo

export enum ChatMessageState {
    Sending = '发送中...',
    Getting = '拉取中...',
    Arrived = '已送达',
}

export enum ChatMessageType {
    File = "File",
    Text = "Text",
    Image = "Image"
}

export type ChatMessageContentType = string | ChatMessageFileInfo | ImageHash

export interface ChatMessageFileInfo {
    hash : string,
    name : string,
    size : number
}

export type ImageHash = string

export class ChatMessage {
    chatId: number
    type : ChatMessageType
    content: ChatMessageContentType
    timestamp: number
    inChatId?: ChatId
    senderId: UserId
    state: ChatMessageState
    clientId?: ClientId
    
    bindUploading? : UploadingFile

    static getLoadingMessage(inChatId: ChatId, chatId: ChatId) {
        return new ChatMessage({
            type : ChatMessageType.Text,
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
            type : receiveMessage.type,
            content : JSON.parse(receiveMessage.serializedContent),
            timestamp: receiveMessage.timestamp,
            inChatId: receiveMessage.inChatId,
            senderId: receiveMessage.senderId,
            state: ChatMessageState.Arrived,
            chatId: receiveMessage.chatId,
        })
    }

    serialized(): SerializedReceiveChatMessage {
        const receiveMessage : ReceiveChatMessage = {
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
        type : ChatMessageType
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
        return tip
    }
    get asShort() {
        if (this.type === ChatMessageType.Text) {
            return this.content as string
        } else {
            return "文件/图片消息"
        }
    }

    setToSelf(msg: ChatMessage) {
        this.content = msg.content
        this.timestamp = msg.timestamp
        this.inChatId = msg.inChatId
        this.senderId = msg.senderId
        this.state = msg.state
        this.content = msg.content
        this.type = msg.type
        this.chatId = msg.chatId
    }
}

export enum ChatType {
    Private,
    Group,
    Unknown,
}

export class Chat {
    messages: Map<MessageId, ChatMessage> = new Map()
    private sendingMessages: ChatMessage[] = []

    private lastClientId: number = 0

    errors = ''

    chatId: ChatId = 0
    chatType: ChatType = ChatType.Unknown

    groupName: string | null = ''
    groupAvaterPath: string | null = ''

    bindUser: User | null = null

    lastMessage: ChatMessage | undefined = undefined

    readCursor: number = 0

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    static getLoadingChat(chatId: ChatId) {
        let ret = new Chat()
        ret.chatId = chatId
        return ret
    }

    get sidebarTitle() {
        if (this.chatType === ChatType.Private) return '用户信息'
        return '群聊信息'
    }

    setReadCuser() {
        let inChatId = 0
        if (this.lastMessage !== undefined) {
            if (this.lastMessage.inChatId) {
                inChatId = this.lastMessage.inChatId
                this.readCursor = inChatId
            } else {
                inChatId = this.readCursor
            }
        }
        MessageServer.Instance().send<Send.SetAlreadyRead>(Send.SetAlreadyRead, {
            chatId: this.chatId,
            inChatId: inChatId
        })
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
        return this.lastMessage.inChatId! - this.readCursor
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
        return this.lastMessage === undefined ? 0 : this.lastMessage.inChatId! - this.readCursor
    }

    setChatInfo(info: ChatInfo) {
        if ('name' in info) {
            // 群聊
            this.groupName = info.name
            this.groupAvaterPath = info.avaterPath
            this.chatType = ChatType.Group
        } else {
            // 私聊
            const users: [number, number] = info.users
            const otherId = users[0] === authStore.userId ? users[1] : users[0]
            this.bindUser = userStore.getUser(otherId)
            this.chatType = ChatType.Private
        }
        LocalDatabase.saveChatInfo(this.chatId, info)
    }

    setMessage(msg: ChatMessage) {
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

    getMessage(inChatId: MessageId) {
        if (this.messages.has(inChatId)) {
            return this.messages.get(inChatId)!
        }
        const msg = ChatMessage.getLoadingMessage(inChatId, this.chatId)
        this.messages.set(inChatId, msg)
        // TODO : 从本地数据库拉取数据

        return msg
    }

    getMessages(endId: MessageId, count: number): ChatMessage[] {
        if (count === 1) {
            return [this.getMessage(endId)]
        }
        const startId = Math.max(endId - count + 1, 1)
        endId = this.lastMessage === undefined ? 0 : Math.min(endId, this.lastMessage.inChatId!)

        if (endId < startId) {
            return []
        }

        const msgs: ChatMessage[] = []

        for (let i = startId; i <= endId; i++) {
            // TODO : 这里可以少一次查询
            if (!this.messages.has(i)) {
                this.messages.set(i, ChatMessage.getLoadingMessage(i, this.chatId))
            }
            msgs.push(this.messages.get(i)!)
        }

        LocalDatabase.loadMessages(this.chatId, startId, endId)

        return msgs
    }

    sendFileMessage(type : ChatMessageType, file : File, contentProducer : (hash : string, file : File) => any) {
        const timestamp = Date.now()
        let msg = new ChatMessage({
            type,
            content : "",
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId
        })
        msg.clientId = ++this.lastClientId

        const sendingMessages = this.sendingMessages
        const chatId = this.chatId
        
        const uploading = fileStore.requestUpload(file, action((uploading : UploadingFile) => {
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
        }))

        msg.bindUploading = uploading
        return msg
    }

    sendTextMessage(text: string) {
        const timestamp = Date.now()
        const data: SendSendMessageData = {
            type : ChatMessageType.Text,
            clientId: ++this.lastClientId,
            serializedContent : JSON.stringify(text),
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            type :ChatMessageType.Text,
            content : text,
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
            chatId: this.chatId
        })
        msg.clientId = data.clientId

        // TODO : Response超时
        this.sendingMessages.push(msg)
        MessageServer.Instance().send<Send.SendMessage>(Send.SendMessage, data)
        return msg
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

    activeChatId: undefined | ChatId = undefined
    setViewMessages: undefined | Updater<ChatMessage[]> = undefined
    setActiveChatId: undefined | React.Dispatch<React.SetStateAction<number | null>> = undefined

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
    }

    reset() {
        this.chats.clear()
        this.setViewMessages = undefined
        this.activeChatId = undefined
        this.errors = ''
    }

    get privateChatGroup() {
        const chats: Chat[] = []
        const nonChineseChats: Chat[] = []
        let groupCounts: number[] = Array(27).fill(0)
        const groups: string[] = []
        const firstLetter = (chat: Chat) =>
            pinyin(chat.name[0].toLowerCase(), { pattern: 'initial', toneType: 'none' })

        this.chats.forEach((chat, _) => {
            if (chat.chatType === ChatType.Private) {
                if (chineseRegex.test(chat.name[0])) {
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

    get recentChatsView() {
        // 1.数据有序
        // 2.timestamp在一定范围

        // TODO : listView使用二叉树维护
        // O(nlogn + rank) => O(rank+logn)
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
        if (this.chats.has(chatId)) {
            return this.chats.get(chatId)!
        }
        const ret = Chat.getLoadingChat(chatId)
        this.chats.set(chatId, ret)

        LocalDatabase.loadChatInfo(chatId)
        return ret
    }

    private SetAlreadyReadResponseHandler(response: ReceiveSetAlreadyReadResponseData) {
        console.log(response.state)
    }

    private ReadCusersHandler(cusers: [number, number][]) {
        cusers.forEach(([chatId, cuser]) => {
            this.getChat(chatId)
            this.chats.get(chatId)!.readCursor = cuser
        })
    }

    private removeChatInfo(chat: Chat) {
        chatStore.setActiveChatId && chatStore.setActiveChatId(null)
        userSettingStore.setChatVerify(chat.chatId, '')
        chat.bindUser && userSettingStore.setUserNickName(chat.bindUser.userId, '')
        for (let inChatId = 1; inChatId <= chat.lastMessage!.inChatId!; inChatId++) { // 清除聊天记录
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
        if (chat.chatType === ChatType.Private) { // 删除私聊
            LocalDatabase.removeUserInfo(chat.bindUser!.userId).catch((err) => console.log(err)) // 清除用户
        } 
        this.removeChatInfo(chat)
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
        }
    }
}

export const chatStore = new ChatStore()
