import { action, makeAutoObservable } from "mobx"
import { Chat, ChatMessage, ChatMessageState, ChatMessageType, chatStore } from "../../stores/chatStore"
import { observer } from "mobx-react-lite"
import { modalStore } from "../../stores/modalStore"
import { Send, SendSendMessageData } from "../../utils/message"
import { authStore } from "../../stores/authStore"
import { User } from "../../stores/userStore"
import { MessageServer } from "../../utils/networkWs"
import { requestStore } from "../../stores/requestStore"

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

export class UserSelectStore {
    users: Map<number, User> = new Map()
    errors: string = ''
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get isEmpty() {
        return this.users.size === 0
    }

    inviteUsers(chatId: number) {
        if (this.isEmpty) {
            this.errors = '请选择一个好友，来邀请他/她加入群聊'
            return
        }
        this.usersList.forEach((user, _) => {
            requestStore.sendGroupInvitationRequest(chatId, user.userId)
        })
        console.log('清除选中')
        this.reset()
    }

    hasSelectUser(userId: number) {
        return this.users.has(userId)
    }

    reset() {
        this.users.clear()
        this.errors = ''
    }

    toggleCheckUser(user: User) {
        if (this.hasSelectUser(user.userId)) this.unCheckUser(user)
        else this.checkUser(user)
    }

    checkUser(user: User) {
        this.users.set(user.userId, user)
    }

    unCheckUser(user: User) {
        if (this.users.has(user.userId)) this.users.delete(user.userId)
    }

    get usersList() {
        const userList: User[] = []
        this.users.forEach((user, _) => {
            userList.push(user)
        })
        return userList
    }
}

export const userSelectStore = new UserSelectStore()

export const UserSelector = observer(({ user }: { user: User }) => {
    return (
        <label className="c_checkbox">
            <input
                readOnly={true}
                type="checkbox"
                checked={userSelectStore.hasSelectUser(user.userId)}
            />
            <span className="checkmark"></span>
        </label>
    )
})

class CreateGroupFromAllFriendsSelectStore {
    users: Map<number, User> = new Map()
    showSelector: boolean = false
    errors: string = ''

    reset() {
        this.users.clear()
        this.errors = ''
        this.showSelector = false
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get isEmpty() {
        return this.users.size === 0
    }

    inviteUsers(chatId: number) {
        if (this.isEmpty) {
            this.errors = '请选择至少一个好友，来创建群聊'
            return
        }
        this.usersList.forEach((user, _) => {
            requestStore.sendGroupInvitationRequest(chatId, user.userId)
        })
        console.log('清除选中')
        this.reset()
    }

    hasSelectUser(userId: number) {
        return this.users.has(userId)
    }

    toggleShowSelector() {
        this.showSelector = !this.showSelector
    }

    toggleCheckUser(user: User) {
        if (this.hasSelectUser(user.userId)) this.unCheckUser(user)
        else this.checkUser(user)
    }

    checkUser(user: User) {
        this.users.set(user.userId, user)
    }

    unCheckUser(user: User) {
        if (this.users.has(user.userId)) this.users.delete(user.userId)
    }

    get usersList() {
        const userList: User[] = []
        this.users.forEach((user, _) => {
            userList.push(user)
        })
        return userList
    }
}

export const createGroupFromAllFriendsSelectStore = new CreateGroupFromAllFriendsSelectStore()

export const CreateGroupFromAllFriendSelector = observer(({ user }: { user: User }) => {
    return (
        <label className="c_checkbox">
            <input
                onChange={() => createGroupFromAllFriendsSelectStore.toggleCheckUser(user)}
                type="checkbox"
                checked={createGroupFromAllFriendsSelectStore.hasSelectUser(user.userId)}
            />
            <span className="checkmark"></span>
        </label>
    )
})