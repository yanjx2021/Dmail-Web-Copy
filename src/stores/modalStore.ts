import { makeAutoObservable } from 'mobx'
import { Chat, ChatMessage, ChatMessageTransferInfo, chatStore } from './chatStore'
import { ReceiveChatMessage } from '../utils/message'

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
        | 'GetUserIds' = ''
    transferInfo: ChatMessageTransferInfo | undefined = undefined
    groupMessageReaders: number[] | undefined

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
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export const modalStore = new ModalStore()
