import { action, makeAutoObservable } from "mobx"
import { Chat, ChatMessage, ChatMessageState, ChatMessageType, chatStore } from "../../stores/chatStore"
import { observer } from "mobx-react-lite"
import { modalStore } from "../../stores/modalStore"
import { SendSendMessageData } from "../../utils/message"
import { authStore } from "../../stores/authStore"

export class MessageSelectStore {
    msgs: Map<number, ChatMessage> = new Map()
    chat: Chat | undefined = undefined
    showSelector: boolean = false
    errors: string = ''
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    transfer() { // 转发
        if (this.chat === undefined) {
            this.errors = '请选择一个聊天进行消息转发'
            return
        }
        modalStore.handleCancel()
        const msg = this.chat.sendTransferMessage(this.msgsList)
        if (this.chat.chatId === chatStore.activeChatId && chatStore.setViewMessages) {
            chatStore.setViewMessages((draft) => {
                draft.push(msg)
            })
        }
        this.reset()
    }

    hasSelectMessage(inChatId: number) {
        return this.msgs.has(inChatId)
    }

    reset() {
        this.showSelector = false
        this.msgs.clear()
        this.chat = undefined
        this.errors = ''
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

    hasSelectChat(chat: Chat) {
        return this.chat === chat
    }

    toggleCheckChat(chat: Chat) {
        if (this.chat === chat) {
            this.unCheckChat(chat)
        } else {
            this.checkChat(chat)
        }
    }

    checkChat(chat: Chat) {
        this.chat = chat
    }

    unCheckChat(chat: Chat) {
        if (this.chat === chat) {
            this.chat = undefined
        }
    }


    get msgsList() {
        const list: ChatMessage[] = []
        this.msgs.forEach((msg, inChatId) => {
            list.push(msg)
        })
        list.sort(action((a, b) => a.inChatId! - b.inChatId!))
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

export const ChatSelector = (({ chat }: { chat: Chat }) => {
    return (
        <label className="c_checkbox">
            <input
                type="checkbox"
                onChange={() => messageSelectStore.toggleCheckChat(chat)}
                checked={messageSelectStore.hasSelectChat(chat)}
            />
            <span className="checkmark"></span>
        </label>
    )
})
