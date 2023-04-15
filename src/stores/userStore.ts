import { makeAutoObservable } from 'mobx'
import { UserId } from './authStore'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveGetUserInfoResponseData, ReceiveGetUserInfoResponseState, Send } from '../utils/message'
import { LocalDatabase } from './localData'

export class User {
    name = '加载中...'
    avaterPath = ''

    setToSelf(user: User) {
        this.name = user.name
        this.avaterPath = user.avaterPath
    }

    serialized() {
        const user = {
            name: this.name,
            avaterPath: this.avaterPath
        }
        return JSON.stringify(user)
    }

    constructor(name: string, avater_path: string) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.name = name
        this.avaterPath = avater_path
    }
}

export class UserStore {
    users: Map<number, User> = new Map()
    errors: string = ''
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.GetUserInfoResponse, this.getUserInfoResponseHandler)
    }

    reset() {
        this.users.clear()
        this.errors = ''
    }


    getUserInfoResponseHandler(data: ReceiveGetUserInfoResponseData) {
        switch (data.state) {
            case ReceiveGetUserInfoResponseState.Success:
                console.log(`接受用户${data.userId}的信息`)
                this.setUser(data.userId!, data.userName!, data.avaterPath!)
                LocalDatabase.saveUserInfo(data.userId!, this.createUser(data.userName!, data.avaterPath!))
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
            user.avaterPath = avater_path
            this.users.get(useId)?.setToSelf(user)
        }
    }

    getUser(userId: UserId) {
        const user = this.users.get(userId)
        if (user === undefined) {
            this.users.set(userId, this.createLoadingUser())
            //TODO pull_user_info
            LocalDatabase.loadUserInfo(userId)
            return this.users.get(userId)!
        } else {
            return user
        }
    }
}

export const userStore: UserStore = new UserStore()
