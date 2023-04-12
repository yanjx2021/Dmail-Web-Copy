import localforage from 'localforage'
import { makeAutoObservable, observable, override, runInAction } from 'mobx'
import { UserId, authStore } from './authStore'
import {
    Receive,
    ReceiveChatMessage,
    ReceivePullResponseData,
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

export type ChatId = number

export type MessageId = number

export type MessageReadCursor = MessageId

type ClientId = number

export enum ChatMessageState {
    Sending = "发送中...",
    Getting = "拉取中...",
    Arrived = "已送达",
}

export class ChatMessage {
    text: string
    timestamp: number
    inChatId?: ChatId
    senderId: UserId
    state: ChatMessageState
    clientId?: ClientId

    static getLoadingMessage(inChatId: ChatId) {
        return new ChatMessage({
            text: `消息${inChatId}`,
            inChatId: inChatId,
            timestamp: 0,
            senderId: 0,
            state: ChatMessageState.Getting,
        })
    }

    static createFromReciveMessage(receiveMessage: ReceiveChatMessage) {
        return new ChatMessage({
            text: receiveMessage.text,
            timestamp: receiveMessage.timestamp,
            inChatId: receiveMessage.inChatId,
            senderId: receiveMessage.senderId,
            state: ChatMessageState.Arrived,
        })
    }

    constructor({
        text,
        timestamp,
        inChatId,
        senderId,
        state,
    }: {
        text: string
        timestamp: number
        inChatId: MessageId | undefined
        senderId: UserId
        state: ChatMessageState
    }) {
        makeAutoObservable(this, { inChatId: observable.ref })
        this.text = text
        this.timestamp = timestamp
        this.inChatId = inChatId
        this.senderId = senderId
        this.state = state
    }
    get getMessageTip() {
        let tip = ''
        if (this.senderId === 0) {
            tip += '系统消息'
        } else {
            tip += userStore.getUser(this.senderId).name
            tip += ' ' + new Date(this.timestamp).toLocaleString()
        }

        tip += ' ' + this.state
        return tip
    }
    setToSelf(msg: ChatMessage) {
        this.text = msg.text
        this.timestamp = msg.timestamp
        this.inChatId = msg.inChatId
        this.senderId = msg.senderId
        this.state = msg.state
    }

    serialized(chatId: number): SerializedReceiveChatMessage {
        const receiveMessage = {
            chatId: chatId,
            senderId: this.senderId,
            inChatId: this.inChatId!,
            text: this.text,
            timestamp: this.timestamp,
        }
        return JSON.stringify(receiveMessage)
    }
}

export enum ChatType {
    Private,
    Group,
    Unknown,
}

export class Chat {
    private messages: Map<MessageId, ChatMessage> = new Map()
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

    get name() {
        if (this.chatType === ChatType.Unknown) {
            return `群聊${this.chatId}`
        } else if (this.chatType === ChatType.Private) {
            return this.bindUser!.name
        }
        return this.groupName!
    }

    get unreadCount() {
        return this.lastMessage === undefined ? 0 : this.lastMessage.inChatId! - this.readCursor
    }

    setChatInfo(info: any) {
        // TODO : More Typescript

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

        // TODO : SaveChatInfo
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

        LocalDatabase.saveMessage(this.chatId, msg)

        if (this.lastMessage === undefined || updated_msg.inChatId! > this.lastMessage.inChatId!) {
            this.lastMessage = updated_msg
        }
    }

    getMessage(inChatId: MessageId) {
        if (this.messages.has(inChatId)) {
            return this.messages.get(inChatId)!
        }
        const msg = ChatMessage.getLoadingMessage(inChatId)
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
                this.messages.set(i, ChatMessage.getLoadingMessage(i))
            }
            msgs.push(this.messages.get(i)!)
        }

        LocalDatabase.loadMessages(this.chatId, startId, endId)

        return msgs
    }

    sendMessage(text: string) {
        const timestamp = Date.now()
        const data: SendSendMessageData = {
            clientId: ++this.lastClientId,
            text: text,
            chatId: this.chatId,
            timestamp,
        }
        let msg = new ChatMessage({
            text: text,
            timestamp,
            inChatId: undefined,
            senderId: authStore.userId,
            state: ChatMessageState.Sending,
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

    errors: string = ''

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.PullResponse, this.ReceivePullResponseHandler)
        MessageServer.on(Receive.Message, this.ReceiveMessageHandler)
        MessageServer.on(Receive.SendMessageResponse, this.ReceiveSendMessageResponseHandler)
        MessageServer.on(Receive.Messages, this.ReceiveMessagesHandler)
        MessageServer.on(Receive.Chat, this.ReceiveChatInfoHandler)
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

    setChatInfo(info: any) {
        // TODO : More Typescript

        this.getChat(info.id).setChatInfo(info)
    }

    getChat(chatId: ChatId) {
        if (this.chats.has(chatId)) {
            return this.chats.get(chatId)!
        }
        console.log('chatID ', chatId)
        const ret = Chat.getLoadingChat(chatId)
        this.chats.set(chatId, ret)

        LocalDatabase.loadChatInfo(chatId)
        return ret
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
    }
}

export const chatStore = new ChatStore()
