import localforage from "localforage"
import { ChatMessage, chatStore } from "./chatStore"
import { Send, SerializedReceiveChatMessage } from "../utils/message"
import { MessageServer } from "../utils/networkWs"

export class LocalDatabase {
    private static database : LocalForage = localforage.createInstance(
        { name : "dMail", storeName : "public"})

    static createUserInstance(userId : number) {
        this.database = localforage.createInstance(
            { name : "dMail", storeName : userId.toString()}
        )
    }
    static messageIndex(chatId : number, inChatId : number) {
        return `chat:${chatId}:${inChatId}`
    }

    static async saveMessage(chatId : number, msg : ChatMessage) {
        const serialized = msg.serialized(chatId)
        return localforage.setItem(this.messageIndex(chatId, msg.inChatId!), serialized).catch((err) => {
            console.log("localForage错误 " + err)
        })
    }
    
    static async loadMessages(chatId : number, start : number, end : number) {
        // TODO : 根据unknow选择不同的加载策略
        const unknown : number[] = []
        const promises = []

        const chat = chatStore.getChat(chatId);

        for (let i = start; i <= end; i++) {
            const promise = localforage.getItem<SerializedReceiveChatMessage>(this.messageIndex(chatId, i)).then((value) => {
                if (value == null) {
                    unknown.push(i)
                    return
                }
                let chatMsg = ChatMessage.createFromReciveMessage(JSON.parse(value))
                chat.setMessage(chatMsg)
            }).catch((err) => {
                console.log("localForage错误 " + err)
            })
            promises.push(promise)
        }

        await Promise.all(promises)

        if (unknown.length === 0) {
            return;
        }

        // TODO 
        if (unknown.length < 4) {
            // 逐个
        } else {
            // 合批
        }

        const endId = Math.max(...unknown);
        const startId = Math.min(...unknown);

        MessageServer.Instance().send<Send.GetMessages>(Send.GetMessages, {
            startId,
            endId,
            chatId
        })

    }
    
}
