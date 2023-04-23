import { makeAutoObservable } from "mobx";
import { ChatType } from "./chatStore";
import { userSelectStore } from "../components/MessagesBox/Selector";


export class ChatSideStore {
    open: boolean = false
    type: '' | 'chat' | 'user' = ''

    reset() {
        this.open = false
        this.type = ''
    }

    ChatSidebartoggle() { // 聊天
        if (this.open === false) {
            this.type = 'chat'
            this.open = true
        } else if (this.type !== 'chat') {
            userSelectStore.reset()
            this.type = 'chat'
        } else {
            this.open = false
        }
    }

    UserSidebartoggle() { // 邀请好友
        if (this.open === false) {
            this.type = 'user'
            this.open = true
        } else if (this.type !== 'user') {
            this.type = 'user'
        } else {
            this.open = false
            userSelectStore.reset()
        }
    }

    close() {
        userSelectStore.reset()
        this.open = false
    }

    get sidebarState() {
        if (this.open) {
            console.log(`open-${this.type}-sidebar`)
            return `open-${this.type}-sidebar`
        }
        return ''
    }

    constructor() {
        makeAutoObservable(this, {}, {autoBind: true})
    }
}


export const chatSideStore = new ChatSideStore()