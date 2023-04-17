import localforage from 'localforage'
import { ChatInfo, ChatMessage, chatStore } from './chatStore'
import { Send, SerializedReceiveChatMessage } from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { Request, requestStore } from './requestStore'
import { User, userStore } from './userStore'
import { UserSetting, userSettingStore } from './userSettingStore'

const userSettingIndex = 'userSetting'

export class LocalDatabase {
    private static database: LocalForage = localforage.createInstance({
        name: 'dMail',
        storeName: 'public',
    })

    static createUserInstance(userId: number) {
        this.database = localforage.createInstance({ name: 'dMail', storeName: userId.toString() })
    }
    static messageIndex(chatId: number, inChatId: number) {
        return `chat:${chatId}:${inChatId}`
    }
    static chatInfoIndex(chatId: number) {
        return `chat:${chatId}:info`
    }
    static userInfoIndex(userId: number) {
        return `user:${userId}:info`
    }
    static requestIndex(reqId: number) {
        return `request:${reqId}`
    }

    static async saveUserSetting(userSetting: string) {
        this.database.setItem(userSettingIndex, userSetting)
    }

    static async loadUserSetting() {
        this.database.getItem(userSettingIndex).then((value) => {
            if (value === null) {
                // 从后端拉取userSetting
            } else {
                const userSetting = JSON.parse(value as string) as UserSetting
                userSettingStore.setUserSetting(userSetting)
            }
        })
    }

    static async saveUserInfo(userId: number, user: User) {
        const userInfo = user.serialized()
        this.database.setItem(this.userInfoIndex(userId), userInfo).catch((err) => console.error(err))
    }

    static async loadUserInfo(userId: number) {
        this.database.getItem<string>(this.userInfoIndex(userId)).then((value) => {
            if (value === null) {
                // 请求用户信息
                MessageServer.Instance().send<Send.GetUserInfo>(Send.GetUserInfo, userId)
                return
            }
            const info = JSON.parse(value) as { name: string; avaterPath: string }
            userStore.setUser(userId, info.name, info.avaterPath)
        })
    }

    static async saveRequest(reqId: number, req: Request) {
        // 保存request
        const serialized = req.serialized()
        this.database.setItem(this.requestIndex(reqId), serialized).catch((err) => console.error(err))
    }

    static async loadRequest(reqId: number) {
        this.database.getItem<string>(this.requestIndex(reqId)).then((value) => {
            if (value === null) {
                //TODO 目前还没有拉取的接口
                console.log('还没有主动获取Request的接口')
                return
            }
            requestStore.setRequest(JSON.parse(value))
        })
    }

    static async saveChatInfo(chatId: number, chatInfo: ChatInfo) {
        this.database.setItem(this.chatInfoIndex(chatId), JSON.stringify(chatInfo)).catch((err) => console.error(err))
    }

    static async loadChatInfo(chatId: number) {
        return this.database.getItem<string>(this.chatInfoIndex(chatId)).then((serialized) => {
            if (serialized == null) {
                MessageServer.Instance().send<Send.GetChatInfo>(Send.GetChatInfo, chatId)
                return
            }
            const info = JSON.parse(serialized)
            chatStore.setChatInfo(info)
        })
    }

    static async saveMessage(chatId: number, msg: ChatMessage) {
        const serialized = msg.serialized(chatId)
        return this.database
            .setItem(this.messageIndex(chatId, msg.inChatId!), serialized)
            .catch((err) => {
                console.log('localForage错误 ' + err)
            })
    }

    static async loadMessages(chatId: number, start: number, end: number) {
        // TODO : 根据unknow选择不同的加载策略
        const unknown: number[] = []
        const promises = []

        const chat = chatStore.getChat(chatId)

        for (let i = start; i <= end; i++) {
            const promise = this.database
                .getItem<SerializedReceiveChatMessage>(this.messageIndex(chatId, i))
                .then((value) => {
                    if (value == null) {
                        unknown.push(i)
                        return
                    }
                    let chatMsg = ChatMessage.createFromReciveMessage(JSON.parse(value))
                    chat.setMessage(chatMsg)
                })
                .catch((err) => {
                    console.log('localForage错误 ' + err)
                })
            promises.push(promise)
        }

        await Promise.all(promises)

        if (unknown.length === 0) {
            return
        }

        // TODO
        if (unknown.length < 4) {
            // 逐个
        } else {
            // 合批
        }

        const endId = Math.max(...unknown)
        const startId = Math.min(...unknown)

        MessageServer.Instance().send<Send.GetMessages>(Send.GetMessages, {
            startId,
            endId,
            chatId,
        })
    }
}
