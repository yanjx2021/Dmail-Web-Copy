import { makeAutoObservable } from 'mobx'
import { userSelectStore } from '../components/MessagesBox/Selector'
import { User } from './userStore'

export class ChatSideStore {
    open: boolean = false
    type: '' | 'chat' | 'user' = ''
    visitUser: User | null = null

    reset() {
        this.open = false
        this.type = ''
        this.visitUser = null
    }

    visitUsertoggle(user: User) {
        if (this.open === false) {
            this.visitUser = user
            this.type = 'chat'
            this.open = true
        } else if (this.type !== 'chat') {
            this.visitUser = user
            this.type = 'chat'
        } else if (this.visitUser !== user) {
            this.visitUser = user
        } else {
            this.reset()
            userSelectStore.reset()
        }
    }

    ChatSidebartoggle() {
        // 聊天
        if (this.open === false) {
            this.type = 'chat'
            this.open = true
        } else if (this.type !== 'chat') {
            this.type = 'chat'
        } else if (this.visitUser !== null) {
            this.visitUser = null
        } else {
            this.reset()
            userSelectStore.reset()
        }
    }

    UserSidebartoggle() {
        // 邀请好友
        this.visitUser = null
        if (this.open === false) {
            this.type = 'user'
            this.open = true
        } else if (this.type !== 'user') {
            this.type = 'user'
        } else {
            this.reset()
            userSelectStore.reset()
        }
    }

    close() {
        this.reset()
        userSelectStore.reset()
    }

    get sidebarState() {
        if (this.open) {
            return `open-${this.type}-sidebar`
        }
        return ''
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }
}

export const chatSideStore = new ChatSideStore()
