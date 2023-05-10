import { makeAutoObservable } from 'mobx'
import { Chat, ChatMessage, ChatMessageTransferInfo, ChatType, chatStore } from './chatStore'
import { ReceiveChatMessage } from '../utils/message'
import { userStore } from './userStore'

export class ModalStore {
    isOpen: boolean = false
    isLoading: boolean = false
    modalType:
        | ''
        | 'AddFriend'
        | 'CreateGroup'
        | 'ChangePassword'
        | 'RemoveSecure'
        | 'SetSecure'
        | 'TransferChat'
        | 'TransferChatBox'
        | 'JoinGroup'
        | 'ChangeGroupName'
        | 'GroupMessageReaders'
        | 'GetUserIds'
        | 'SendGroupNotice' 
        | 'LogOff'
        | 'ReplyText'
        | 'SelectMessages' = ''
    transferInfo: ChatMessageTransferInfo | undefined = undefined
    groupMessageReaders: number[] | undefined
    replyMessageId: number | undefined
    sendReplyMessageHandler: any
    selectMessageChat: Chat | undefined
    selectMessageList: ChatMessage[] | undefined

    get showSelectSender() {
        return this.selectMessageChat?.chatType !== ChatType.Private
    }

    get selectUserIds() {
        if (!this.showSelectSender) {
            return []
        }
        const userIds: number[] = []
        this.selectMessageList?.forEach((message, _) => {
            if (userIds.indexOf(message.senderId) === -1 && message.senderId !== 0) {
                userIds.push(message.senderId)
            }
        })
        return userIds
    }

    get selectUserOption() {
        return this.selectUserIds.map((userId) => {
            return {
                value: userId,
                label: userStore.getUser(userId).showName
            }
        })
    }

    handleCancel() {
        this.isOpen = false
    }

    get transferData() {
        if (this.transferInfo) {
            const msgs = this.transferInfo.messages.map((value, _) =>
                ChatMessage.createFromReciveMessage(JSON.parse(value) as ReceiveChatMessage)
            ) as ChatMessage[]
            return {
                userId: this.transferInfo.userId,
                messages: msgs,
            }
        }
    }

    reset() {
        this.isOpen = false
        this.isLoading = false
        this.modalType = ''
        this.transferInfo = undefined
        this.groupMessageReaders = undefined
        this.replyMessageId = undefined
        this.selectMessageChat = undefined
        this.selectMessageList = undefined
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export const modalStore = new ModalStore()
