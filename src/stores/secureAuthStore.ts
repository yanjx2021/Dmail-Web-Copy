import { SHA256 } from 'crypto-js'
import { makeAutoObservable } from 'mobx'
import { Updater } from 'use-immer'
import { userSettingStore } from './userSettingStore'

export class SecureAuthStore {
    chatVerify: Map<number, boolean> = new Map()
    chatId: number = 0
    showSecureBox: boolean = false


    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    clearVerify(chatId: number) {
        this.chatVerify.delete(chatId)
    }

    setVerifyState(chatId: number, checked: boolean) {
        this.chatVerify.set(chatId, checked)
    }

    isAccessible(chatId: number) {
        const check = this.chatVerify.get(chatId)
        if (check === undefined) return true
        return check
    }

    verifyChat(chatId: number, unserializedCode: string) {
        const code = SHA256('tombDisco' + unserializedCode + 'dmail').toString()
        if (code === userSettingStore.getSecondaryCode(chatId)) {
            return true
        }
        return false
    }

    reset() {
        this.chatVerify.clear()
    }

}

export const secureAuthStore = new SecureAuthStore()