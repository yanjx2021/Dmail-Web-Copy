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
        this.userIds = undefined
        this.users = undefined
    }

    findUser(userName: string) {
        MessageServer.Instance().send<Send.GetUserID>(Send.GetUserID, userName)
    }

    getUserIDResponseHandler(response: ReceiveGetUserIDResponseData) {
        switch (response.state) {
            case 'Success':
                this.userIds = response.userIds
                this.users = this.userIds.map((userId) => userStore.getUser(userId))
                break
            case 'NotFound':
                this.userIds = []
                this.users = []
                break
            default:
                console.log(response.state)
                
        }
        
    }
}

export const getUserIdStore = new GetUserIdStore()