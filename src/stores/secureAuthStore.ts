import { SHA256 } from 'crypto-js'
import { makeAutoObservable } from 'mobx'
import { Updater } from 'use-immer'
import { userSettingStore } from './userSettingStore'
import { secondaryCodeHash } from '../constants/passwordHash'

export class SecureAuthStore {
    chatVerify: Map<number, boolean> = new Map() // true表示有权限访问
    chatId: number = 0
    errors: string = ''

    hasChecked(chatId: number) {
        const check = this.chatVerify.get(chatId)
        if (check === undefined) return false
        return !check
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    get showError() {
        return this.errors !== ''
    }

    get hasSetCode() {
        if (this.chatVerify.get(this.chatId) === undefined) return false
        return true
    }

    hasSetChatCode(chatId: number) {
        if (this.chatVerify.get(chatId) === undefined) return false
        return true
    }

    clearVerify(chatId: number) {
        this.chatVerify.delete(chatId)
    }

    setVerifyState(chatId: number, check: boolean) {
        this.chatVerify.set(chatId, check)
    }

    get showSecureBox() {
        const check = this.chatVerify.get(this.chatId)
        if (check === undefined) return false
        return !check
    }

    verifyChat(unserializedCode: string) {
        const code = secondaryCodeHash(unserializedCode)
        if (code === userSettingStore.getSecondaryCode(this.chatId)) {
            this.setVerifyState(this.chatId, true)
            return
        }
        this.errors = '密码错误，无权访问'
    }

    reset() {
        this.chatVerify.clear()
    }

}

export const secureAuthStore = new SecureAuthStore()