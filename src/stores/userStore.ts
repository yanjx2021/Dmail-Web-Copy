import { makeAutoObservable } from 'mobx'
import { UserId } from './authStore'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveGetUserInfoResponseData, ReceiveGetUserInfoResponseState, Send } from '../utils/message'
import { LocalDatabase } from './localData'
import { imageStore } from './imageStore'

export class User {
    userId: number = 0
    name = '加载中...'
    nickname = ''
    avaterHash = ''

    setToSelf(user: User) {
        this.userId = user.userId
        this.name = user.name
        this.avaterHash = user.avaterHash
        this.nickname = user.nickname
    }

    get getAvaterUrl() {
        if (this.avaterHash && this.avaterHash !== '') return imageStore.getImageUrl(this.avaterHash).url
        return 'assets/images/user.png'
    }

    setNickname(nickname: string) {
        this.nickname = nickname
    }
    setName(name: string) {
        this.name = name
    }
    setAvaterHash(hash: string) {
        this.avaterHash = hash
    }
    get showName() {
        return this.nickname === '' ? this.name : this.nickname
    }

    get originName() {
        return this.name
    }

    serialized() {
        const user = {
            userId: this.userId,
            name: this.name,
            avaterHash: this.avaterHash,
        }
        return JSON.stringify(user)
    }

    constructor(userId: number, name: string, avater_path: string, nickname: string = '') {
        makeAutoObservable(this, {}, { autoBind: true })
        this.userId = userId
        this.name = name
        this.avaterHash = avater_path
        this.nickname = nickname
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
                this.setUser(data.userId!, data.userName!, data.avaterHash!)
                LocalDatabase.saveUserInfo(data.userId!, this.createUser(data.userId!, data.userName!, data.avaterHash!))
                break
            default:
                this.errors = '服务器跑路了'
        }
    }

    setUserNickname(userId: number, nickname: string) {
        const user = this.users.get(userId)
        if (user === undefined) {
            this.users.set(userId, this.createUser(userId, '加载中...', '', nickname))
            LocalDatabase.loadUserInfo(userId)
        } else {
            user.setNickname(nickname)
            this.users.get(userId)?.setToSelf(user)
        }
    }

    createUser(userId: number, name: string, avater_path: string, nickname: string = '') {
        return new User(userId, name, avater_path, nickname)
    }

    createLoadingUser(userId: number) {
        return new User(userId, '加载中...', '', '')
    }

    setUser(useId: number, name: string, avater_path: string, nickname?: string) {
        const user = this.users.get(useId)
        if (user === undefined) {
            this.users.set(useId, this.createUser(useId, name, avater_path, ''))
        } else {
            user.setName(name)
            user.avaterHash = avater_path
            nickname && user.setNickname(nickname)
            this.users.get(useId)?.setToSelf(user)
        }
    }

    getUser(userId: UserId) {
        const user = this.users.get(userId)
        if (user === undefined) {
            this.users.set(userId, this.createLoadingUser(userId))
            //TODO pull_user_info
            LocalDatabase.loadUserInfo(userId)
            return this.users.get(userId)!
        } else {
            return user
        }
    }
}

export const userStore: UserStore = new UserStore()
