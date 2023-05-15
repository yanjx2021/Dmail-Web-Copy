import { action, makeAutoObservable } from 'mobx'
import {
    LoginResponseState,
    Receive,
    ReceiveApplyForTokenResponesData,
    ReceiveLogOffResponseData,
    ReceiveLoginResponseData,
    Send,
} from '../utils/message'
import { MessageServer } from '../utils/networkWs'
import { passwordTester } from '../constants/passwordFormat'
import { SHA256 } from 'crypto-js'
import { LocalDatabase } from './localData'
import { emailTester } from '../constants/passwordFormat'
import { chatStore } from './chatStore'
import { requestStore } from './requestStore'
import { userStore } from './userStore'
import { updateUserStore } from './updateUserStore'
import { secureAuthStore } from './secureAuthStore'
import { modalStore } from './modalStore'
import { chatSideStore } from './chatSideStore'
import { noticeStore } from './noticeStore'
import { getUserIdStore } from './getUserIdStore'
import { notificationStore } from './notificationStore'
import { updateGroupStore } from './updateGroupStore'
import { userSettingStore } from './userSettingStore'
import { tokenStore } from './tokenStore'

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
    
    tokenEmail: string | undefined = undefined
    token: string | undefined = undefined 

    get userSelf() {
        return userStore.getUser(this.userId)
    }

    setToken(t: string) {
        this.token = t
    }
    setTokenEmail(e: string) {
        this.tokenEmail = e
    }
    
    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.LoginResponse, this.loginResponseHandler)
        MessageServer.on(Receive.LogOffResponse, this.logoffResponseHandler)
        MessageServer.on(Receive.ApplyForTokenResponse, this.applyForTokenResponseHandler)
    }

    applyForTokenResponseHandler(response: ReceiveApplyForTokenResponesData) {
        if (response.state !== 'Success') {
            this.errors = '签发令牌失败'
            return 
        }
        this.token = response.token
        LocalDatabase.saveTokenObject({
            email: this.email,
            token: response.token!,
            timestamp: response.timestamp!
        })
    }

    logoffResponseHandler(response: ReceiveLogOffResponseData) {
        if (response.state !== 'Success') {
            this.errors = '注销用户失败'
            return
        }
        alert('哈哈，你的账户被注销啦')
        this.logout()
    }

    reset() {
        this.state = AuthState.Started
        this.method = AuthMethod.Password
        this.userId = 0
        this.email = ''
        this.emailCode = ''
        this.password = ''
        this.errors = ''
        this.token = undefined
        this.tokenEmail = undefined
    }

    logout() {
        if (this.state !== AuthState.Logged) {
            console.error('尚未登录', this.state)
            return
        }
        LocalDatabase.removeTokenObject()
        this.reset()
        chatStore.reset()
        requestStore.reset()
        secureAuthStore.reset()
        updateUserStore.reset()
        userStore.reset()
        modalStore.reset()
        chatSideStore.reset()
        getUserIdStore.reset()
        notificationStore.reset()
        updateGroupStore.reset()
        userSettingStore.reset()
        tokenStore.reset()
        MessageServer.destroyInstance()
    }

    logoff() {
        MessageServer.Instance().send<Send.LogOff>(Send.LogOff, parseInt(this.emailCode))
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

        LocalDatabase.loadTimestamp().then(
            action(() => {
                MessageServer.Instance().send(Send.Pull, {
                    lastRequestId: 0,
                    noticeTimestamp: noticeStore.timestamp!,
                })
            })
        )
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
        this.timer = setTimeout(
            action(() => {
                this.state = AuthState.Started
                this.errors = '网络连接超时，请检查网络状况'
                MessageServer.destroyInstance()
            }),
            this.timeout
        )

        this.state = AuthState.Logging
    }

    private loginWithCode() {
        MessageServer.Instance().send<Send.Login>(Send.Login, {
            email: this.email,
            emailCode: parseInt(this.emailCode),
        })
        this.timer = setTimeout(
            action(() => {
                this.state = AuthState.Started
                this.errors = '网络连接超时，请检查网络状况'
                MessageServer.destroyInstance()
            }),
            this.timeout
        )
        this.state = AuthState.Logging
    }

    loginWithToken() {
        if (this.tokenEmail && this.token) {
            this.email = this.tokenEmail
            MessageServer.Instance().send<Send.Login>(Send.Login, {
                email: this.tokenEmail,
                token: this.token,
            })
        }
        this.timer = setTimeout(
            action(() => {
                this.state = AuthState.Started
                this.errors = '网络连接超时，请检查网络状况'
                MessageServer.destroyInstance()
            }),
            this.timeout
        )
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
