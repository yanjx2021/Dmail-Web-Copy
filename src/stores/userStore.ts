import { makeAutoObservable } from 'mobx'
import { UserId } from './authStore'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveGetUserInfoResponseData, ReceiveGetUserInfoResponseState, Send } from '../utils/message'

export class User {
    name = '加载中...'
    avater_path = ''

    setToSelf(user: User) {
        this.name = user.name
        this.avater_path = user.avater_path
    }

    constructor(name: string, avater_path: string) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.name = name
        this.avater_path = avater_path
    }
}

export class UserStore {
    users: Map<number, User> = new Map()
    errors: string = ''
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.GetUserInfoResponse, this.getUserInfoResponseHandler)
    }

    getUserInfo(userId: number) {
        console.log(`请求用户${userId}的信息`)
        MessageServer.Instance().send<Send.GetUserInfo>(Send.GetUserInfo, userId)
    }

    getUserInfoResponseHandler(data: ReceiveGetUserInfoResponseData) {
        switch (data.state) {
            case ReceiveGetUserInfoResponseState.Success:
                console.log(`接受用户${data.userId}的信息`)
                this.setUser(data.userId!, data.userName!, data.avaterPath!)
                break
            default:
                this.errors = '服务器跑路了'
        }
    }

    createUser(name: string, avater_path: string) {
        return new User(name, avater_path)
    }

    createLoadingUser() {
        return new User('加载中...', '')
    }

    setUser(useId: number, name: string, avater_path: string) {
        const user = this.users.get(useId)
        if (user === undefined) {
            this.users.set(useId, this.createUser(name, avater_path))
        } else {
            user.name = name
            user.avater_path = avater_path
            this.users.get(useId)?.setToSelf(user)
        }
    }

    getUser(userId: UserId) {
        const user = this.users.get(userId)
        if (user === undefined) {
            this.users.set(userId, this.createLoadingUser())
            //TODO pull_user_info
            this.getUserInfo(userId)
            return this.users.get(userId)!
        } else {
            return user
        }
    }
}

export const userStore: UserStore = new UserStore()
