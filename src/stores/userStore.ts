import { makeAutoObservable } from 'mobx'
import { UserId } from './authStore'

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
    }

    createUser(name: string, avater_path: string) {
        return new User(name, avater_path)
    }

    createLoadingUser() {
        return new User('加载中...', '')
    }

    setUser(name: string, useId: number, avater_path: string) {
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
            return this.users.get(userId)!
            //TODO pull_user_info
        } else {
            return user
        }
    }
}

export const userStore: UserStore = new UserStore()
