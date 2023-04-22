import { makeAutoObservable } from "mobx"
import { ChatMessage } from "../../stores/chatStore"
import { observer } from "mobx-react-lite"

export class MessageSelectStore {
    msgs: Map<number, ChatMessage> = new Map()
    chatId: number = -1
    showSelector: boolean = false
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    transfer() { // 转发
        console.log(this.chatId)
        console.log(this.msgsList)
    }

    hasSelectMessage(inChatId: number) {
        return this.msgs.has(inChatId)
    }

    reset() {
        this.showSelector = false
        this.msgs.clear()
        this.chatId = -1
    }

    toggleCheckMessage(msg: ChatMessage) {
        console.log(this.msgsList)
        if (this.hasSelectMessage(msg.inChatId!)) this.unCheckMsg(msg)
        else this.checkMsg(msg)
    }

    checkMsg(msg: ChatMessage) {
        this.msgs.set(msg.inChatId!, msg)
    }

    unCheckMsg(msg: ChatMessage) {
        if (this.msgs.has(msg.inChatId!)) {
            this.msgs.delete(msg.inChatId!)
        }
    }

    hasSelectChat(chatId: number) {
        return this.chatId === chatId
    }

    toggleCheckChat(chatId: number) {
        if (this.chatId === chatId) {
            this.unCheckChat(chatId)
        } else {
            this.checkChat(chatId)
        }
    }

    checkChat(chatId: number) {
        this.chatId = chatId
    }

    unCheckChat(chatId: number) {
        if (this.chatId === chatId) {
            this.chatId = -1
        }
    }


    get msgsList() {
        const list: ChatMessage[] = []
        this.msgs.forEach((msg, inChatId) => {
            list.push(msg)
        })
        list.sort((a, b) => a.inChatId! - b.inChatId!)
        return list
    }
}

export const messageSelectStore = new MessageSelectStore()

export const MessageSelector = observer(({ msg }: { msg: ChatMessage }) => {
    return (
        <label className="c_checkbox">
            <input
                type="checkbox"
                onChange={() => messageSelectStore.toggleCheckMessage(msg)}
                checked={messageSelectStore.hasSelectMessage(msg.inChatId!)}
            />
            <span className="checkmark"></span>
        </label>
    )
})

export const ChatSelector = observer(({ chatId }: { chatId: number }) => {
    return (
        <label className="c_checkbox">
            <input
                type="checkbox"
                onChange={() => messageSelectStore.toggleCheckChat(chatId)}
                checked={messageSelectStore.hasSelectChat(chatId)}
            />
            <span className="checkmark"></span>
        </label>
    )
})
