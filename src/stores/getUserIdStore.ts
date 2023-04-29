import { makeAutoObservable } from 'mobx'
import { User, userStore } from './userStore'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveGetUserIDResponseData, Send } from '../utils/message'

export class GetUserIdStore {
    userIds: number[] | undefined = undefined
    users: User[] | undefined = undefined

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.GetUserIDResponse, this.getUserIDResponseHandler)
    }

    reset() {
        this.userIds = []
        this.users = []
    }

    findUser(userName: string) {
        MessageServer.Instance().send<Send.GetUserID>(Send.GetUserID, userName)
    }

    getUserIDResponseHandler(response: ReceiveGetUserIDResponseData) {
        if (response.state !== 'Success') {
            console.error(response)
            return
        }
        this.userIds = response.userIds
        this.users = this.userIds.map((userId) => userStore.getUser(userId))
    }
}

export const getUserIdStore = new GetUserIdStore()