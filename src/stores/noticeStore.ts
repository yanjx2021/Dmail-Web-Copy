import { makeAutoObservable } from "mobx"
import { LocalDatabase } from "./localData"
import { MessageServer } from "../utils/networkWs"
import { Receive } from "../utils/message"
import { ChatMessageType, chatStore } from "./chatStore"

export type serializedNotice = string

export interface ReceiveNoticeData {
    state: 'Revoked' | 'Mentioned'
    chatId: number,
    inChatId: number,
    timestamp: number
}

export class NoticeStore {
    timestamp: number | undefined = undefined

    constructor() {
        makeAutoObservable(this, {}, {autoBind: true})
        MessageServer.on(Receive.Notice, this.receiveNoticeHandler)
        MessageServer.on(Receive.Notices, this.receiveNoticesHandler)
    }

    updateTimestamp(time: number) {
        if (this.timestamp === undefined || this.timestamp < time) {
            // 更新timestamp为最新
            this.timestamp = time
            LocalDatabase.saveTimeStamp(this.timestamp)
        }
    }

    handleNotice(notice: ReceiveNoticeData) {
        this.updateTimestamp(notice.timestamp + 1)
        switch (notice.state) {
            case 'Revoked':
                const chatR = chatStore.getChat(notice.chatId)
                const msgR = chatR.messages.get(notice.inChatId)
                if (msgR) {
                    msgR.type = ChatMessageType.Revoked
                    msgR.content = ''
                    chatR.setMessage(msgR)
                } else {
                    LocalDatabase.revokeMessageLocal(notice.chatId, notice.inChatId)
                }
                break
            case 'Mentioned':
                const chatM = chatStore.getChat(notice.chatId)
                chatM.atYou = true
                break
            default:
                console.log('error: 错误的协议格式 ' + notice.state)
                break
        }
    }

    receiveNoticeHandler(serializedNotice: serializedNotice) {
        const notice = JSON.parse(serializedNotice) as ReceiveNoticeData
        this.handleNotice(notice)
    }
    receiveNoticesHandler(serializedNotices: serializedNotice[]) {
        serializedNotices.forEach((serializedNotice) => {
            const notice = JSON.parse(serializedNotice)
            this.handleNotice(notice)
        })
    }
}

export const noticeStore = new NoticeStore()