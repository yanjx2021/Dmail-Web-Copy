import { action, makeAutoObservable } from 'mobx'
import localforage from 'localforage'
import { LoginResponseState, Receive, ReceiveLoginResponseData, Send } from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { passwordTester } from '../constants/passwordFormat'
import { SHA256 } from 'crypto-js'
import { LocalDatabase } from './localData'
import { emailTester } from '../constants/passwordFormat'

export type UserId = number

export enum AuthState {
    Started,
    Logging,
    Logged,
}

export enum AuthMethod {
    Email,
    Password,
}

export class AuthStore {
    state: AuthState = AuthState.Started
    method: AuthMethod = AuthMethod.Password
    errors: string = ''
    timer: any
    timeout: number = 3000
    userId: number = 0
    email: string = ''
    password: string = ''
    emailCode: string = ''

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.LoginResponse, this.loginResponseHandler)
    }

    login() {
        if (this.state === AuthState.Logged) {
            this.errors = '用户已登录'
            return
        }
        if (this.state === AuthState.Logging) {
            this.errors = '正在登录'
            return
        }
        if (!emailTester.test(this.email)) {
            this.errors = '邮箱格式错误'
            this.email = ''
            return
        }
        if (this.method === AuthMethod.Email) {
            this.loginWithCode()
        } else {
            this.loginWithPassword()
        }
    }

    toggleLoginMethod() {
        this.method = this.method === AuthMethod.Email ? AuthMethod.Password : AuthMethod.Email
    }

    private onLoginSuccess(userId: UserId) {
        this.state = AuthState.Logged
        this.userId = userId
        LocalDatabase.createUserInstance(userId)
        console.log('登录成功')

        MessageServer.Instance().send(Send.Pull, {
            lastChatId: 0,
            lastMessageId: 0,
            lastRequestId: 0,
        })
    }

    private loginWithPassword() {
        if (!passwordTester.test(this.password)) {
            this.errors = '密码格式错误: 请输入长度为8-20, 包含数字和字母的密码'
            this.password = ''
            return
        }
        MessageServer.Instance().send<Send.Login>(Send.Login, {
            email: this.email,
            password: SHA256(this.password + 'dmail' + this.email).toString(),
        })
        this.timer = setTimeout(action(() => {
            this.state = AuthState.Started
            this.errors = '网络连接超时，请检查网络状况'
        }), this.timeout)

        this.state = AuthState.Logging
    }

    private loginWithCode() {
        MessageServer.Instance().send<Send.Login>(Send.Login, {
            email: this.email,
            emailCode: parseInt(this.emailCode),
        })
        this.timer = setTimeout(action(() => {
            this.state = AuthState.Started
            this.errors = '网络连接超时，请检查网络状况'
        }), this.timeout)
        this.state = AuthState.Logging
    }

    private loginResponseHandler(data: ReceiveLoginResponseData) {
        clearTimeout(this.timer)
        this.state = AuthState.Started
        this.errors = ''
        if (data.state !== LoginResponseState.Success) {
            MessageServer.destroyInstance()
        }
        switch (data.state) {
            case LoginResponseState.PasswordError:
                this.password = ''
                this.errors = '密码错误，请确认密码'
                break
            case LoginResponseState.UserNotFound:
                this.email = ''
                this.password = ''
                this.errors = '未找到用户，请确认邮箱'
                break
            case LoginResponseState.UserLogged:
                this.email = ''
                this.password = ''
                this.errors = '该帐号已登录'
                break
            case LoginResponseState.Unapproved:
                this.errors = '加密协议尚未握手，请稍等'
                break
            case LoginResponseState.ServerError:
                this.errors = '服务器异常，请重试'
                break
            case LoginResponseState.EmailCodeError:
                this.errors = '验证码错误，请重新输入'
                this.emailCode = ''
                break
            case LoginResponseState.Success:
                this.onLoginSuccess(data.userId!)
        }
        console.log(this.errors)
    }

    get showError(): boolean {
        return this.errors !== ''
    }
}

export const authStore = new AuthStore()
