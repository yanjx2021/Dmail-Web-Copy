import { makeAutoObservable } from 'mobx'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveUpdateGroupInfoResponseData, ReceiveUpdateUserInfoResponseData, Send } from '../utils/message'
import { userStore } from './userStore'
import { authStore } from './authStore'
import { LocalDatabase } from './localData'
import { passwordTester } from '../constants/passwordFormat'
import { SHA256 } from 'crypto-js'
import { modalStore } from './modalStore'
import { Chat, chatStore } from './chatStore'

export class UpdateGroupStore {
    updateType: 'GroupName' | 'Avater' = 'GroupName'

    waitResponse: boolean = false
    chat: Chat | undefined = undefined
    newGroupName: string = ''
    newAvaterPath: string = ''

    errors: string = ''


    reset() {
        this.newGroupName = ''
        this.newAvaterPath = ''
        this.waitResponse = false
        this.updateType = 'GroupName'
        this.errors = ''
        this.chat = undefined
    }

    sendUpdateGroupInfo() {
        switch (this.updateType) {
            case 'GroupName':
                if (this.newGroupName === '') {
                    this.errors = '群聊名不能为空'
                    break
                }
                this.chat && MessageServer.Instance().send<Send.UpdateGroupInfo>(Send.UpdateGroupInfo, {
                    chatId: this.chat.chatId,
                    content: {
                        type: 'GroupName',
                        newName: this.newGroupName,
                    }
                })
                break
            case 'Avater':
                // TODO
                break
            default:
                break
        }
        this.waitResponse = true
    }

    writeToStore() {
        switch (this.updateType) {
            case 'GroupName':
                this.chat && chatStore.getChat(this.chat.chatId).setGroupName(this.newGroupName)
                this.chat && LocalDatabase.saveChatInfo(this.chat.chatId, {
                    id: this.chat.chatId,
                    name: this.chat.groupName!,
                    avaterPath: this.chat.groupAvaterPath!,
                })
                this.newGroupName = ''
                break
            case 'Avater':
                // TODO
                break
        }
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.UpdateGroupInfoResponse, this.updateGroupInfoResponseHandler)
    }

    updateGroupInfoResponseHandler(data: ReceiveUpdateGroupInfoResponseData) {
        this.waitResponse = false
        switch (data.state) {
            case 'Success':
                modalStore.handleCancel()
                this.writeToStore()
                break
            case 'ServerError':
                this.errors = '服务器异常'
                this.reset()
                break
        }
    }

    get showError() {
        return this.errors !== ''
    }
}

export const updateGroupStore = new UpdateGroupStore()
