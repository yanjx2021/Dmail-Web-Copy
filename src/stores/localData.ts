import localforage from 'localforage'
import { ChatInfo, ChatMessage, ChatMessageType, chatStore } from './chatStore'
import { ReceiveChatMessage, Send, SerializedReceiveChatMessage } from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { Request, requestStore } from './requestStore'
import { User, userStore } from './userStore'
import { UserSetting, userSettingStore } from './userSettingStore'
import { fileStore } from './fileStore'
import axios from 'axios'
import { imageStore } from './imageStore'
import { serialize } from 'v8'
import { lchown } from 'fs'
import { runInAction } from 'mobx'
import { async } from 'q'
import { noticeStore } from './noticeStore'
import { ExternalApiStore, externalStore } from './externalStore'

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
    static imageBlobIndex(hash: string) {
        return `image:${hash}`
    }

    static timestampIndex() {
        return `timestamp`
    }

    static async saveTimeStamp(timestamp: number) {
        console.log('保存本地时间')
        this.database.setItem(this.timestampIndex(), timestamp)
    }

    static async loadTimestamp() {
        return this.database.getItem<number>(this.timestampIndex()).then((timestamp) => {
            if (timestamp) {
                noticeStore.timestamp = timestamp
            } else {
                console.log('生成本地时间')
                const time = Date.now()
                console.log(time)
                this.saveTimeStamp(time)
                noticeStore.timestamp = time
            }
        })
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

    static async saveImageBlob(hash: string, blob: Blob) {
        this.database.setItem(LocalDatabase.imageBlobIndex(hash), blob)
    }

    static async loadImageBlob(hash: string) {
        this.database.getItem(LocalDatabase.imageBlobIndex(hash)).then((blob) => {
            if (blob === null) {
                fileStore.getFileUrl(hash, (getUrl) => {
                    axios.get(getUrl, { responseType: 'blob' }).then((response) => {
                        this.saveImageBlob(hash, response.data)
                        const localUrl = URL.createObjectURL(response.data)
                        imageStore.setImageUrl(hash, localUrl)
                    })
                })
                return
            }
            const localUrl = URL.createObjectURL(blob as Blob)
            imageStore.setImageUrl(hash, localUrl)
        })
    }

    static async saveUserInfo(userId: number, user: User) {
        const userInfo = user.serialized()
        this.database
            .setItem(this.userInfoIndex(userId), userInfo)
            .catch((err) => console.error(err))
    }

    static async loadUserInfo(userId: number) {
        this.database.getItem<string>(this.userInfoIndex(userId)).then((value) => {
            if (value === null) {
                // 请求用户信息
                MessageServer.Instance().send<Send.GetUserInfo>(Send.GetUserInfo, userId)
                return
            }
            const info = JSON.parse(value) as { name: string; avaterHash: string }
            userStore.setUser(userId, info.name, info.avaterHash)
        })
    }

    static async saveRequest(reqId: number, req: Request) {
        // 保存request
        const serialized = req.serialized()
        this.database
            .setItem(this.requestIndex(reqId), serialized)
            .catch((err) => console.error(err))
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

    static async removeChatInfo(chatId: number) {
        this.database.removeItem(this.chatInfoIndex(chatId)).catch((err) => console.log(err))
    }
    static async removeMessage(chatId: number, inChatId: number) {
        this.database
            .removeItem(this.messageIndex(chatId, inChatId))
            .catch((err) => console.log(err))
    }
    static async removeUserInfo(userId: number) {
        this.database.removeItem(this.userInfoIndex(userId)).catch((err) => console.log(err))
    }

    static async saveChatInfo(chatId: number, chatInfo: ChatInfo) {
        this.database
            .setItem(this.chatInfoIndex(chatId), JSON.stringify(chatInfo))
            .catch((err) => console.error(err))
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

    static async saveMessage(msg: ChatMessage) {
        const local = await this.loadMessageLocal(msg.chatId, msg.inChatId!)

        runInAction(() => {
            if (local?.type === ChatMessageType.Deleted) {
                msg.type = ChatMessageType.Deleted
                return
            }

            const serialized = msg.serialized()
            this.database
                .setItem(this.messageIndex(msg.chatId, msg.inChatId!), serialized)
                .catch((err) => {
                    console.log('localForage错误 ' + err)
                })
        })
    }

    static async loadMessageLocal(chatId: number, inChatId: number) {
        return this.database
            .getItem<SerializedReceiveChatMessage>(this.messageIndex(chatId, inChatId))
            .then((serialized) =>
                serialized ? (JSON.parse(serialized) as ReceiveChatMessage) : null
            )
    }

    static async revokeMessageLocal(chatId: number, inChatId: number) {
        return this.loadMessageLocal(chatId, inChatId).then((receiveMessage) => {
            if (
                receiveMessage === null ||
                receiveMessage.type === ChatMessageType.Deleted ||
                receiveMessage.type === ChatMessageType.Revoked
            )
                return
            receiveMessage.type = ChatMessageType.Revoked
            receiveMessage.serializedContent = JSON.stringify('""')

            this.database.setItem(
                this.messageIndex(chatId, inChatId),
                JSON.stringify(receiveMessage)
            )
        })
    }

    static async saveExternal() {
        this.database.setItem('external', JSON.stringify(externalStore))
    }

    static async loadExternal() {
        return this.database
            .getItem<string>('external')
            .then((serialized) =>
                serialized ? (JSON.parse(serialized) as ExternalApiStore) : null
            )
    }
}
