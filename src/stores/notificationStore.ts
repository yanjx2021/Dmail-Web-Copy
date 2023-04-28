import { makeAutoObservable } from 'mobx'
import { userSettingStore } from './userSettingStore'

export class NotificationStore {
    notification: Notification | null = null
    slient: boolean = false
    show: boolean = false
    muteChats: number[] = []

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    hasMuted(chatId: number) {
        return this.muteChats.indexOf(chatId) > -1
    }

    muteChat(chatId: number) {
        !this.hasMuted(chatId) && userSettingStore.setMuteChat(chatId)
        !this.hasMuted(chatId) && this.muteChats.push(chatId)
    }

    unMuteChat(chatId: number) {
        this.hasMuted(chatId) && userSettingStore.removeMuteChat(chatId)
        this.hasMuted(chatId) && this.muteChats.splice(this.muteChats.indexOf(chatId), 1)
    }

    toggleSlient() {
        this.slient = !this.slient
        userSettingStore.setSlient(this.slient)
    }

    toggleShow() {
        this.show = !this.show
        userSettingStore.setShow(this.show)
    }

    showNotification(chatId: number, title: string, body: string) {
        if (!window.Notification) {
            alert('不支持Web Notification')
            return
        }
        if (this.show && this.muteChats.indexOf(chatId) === -1) {
            this.notification && this.notification.close()
            Notification.requestPermission()
            this.notification = new Notification(title, {
                body,
                silent: this.slient,
            })
            this.notification.onclick = () => {
                this.notification?.close()
            }
        }
    }
}

export const notificationStore = new NotificationStore()
