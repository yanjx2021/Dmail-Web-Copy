import { makeAutoObservable } from "mobx";

export class TokenStore {
    rememberMe: boolean = false

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    toggleRememberMe() {
        this.rememberMe = !this.rememberMe
    }

    reset() {
        this.rememberMe = false
    }
}

export const tokenStore = new TokenStore()