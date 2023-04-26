import { makeAutoObservable } from 'mobx'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveUpdateUserInfoResponseData, Send } from '../utils/message'
import { userStore } from './userStore'
import { authStore } from './authStore'
import { LocalDatabase } from './localData'
import { passwordTester } from '../constants/passwordFormat'
import { SHA256 } from 'crypto-js'
import { modalStore } from './modalStore'

export class UpdateUserStore {
    updateType: 'Password' | 'UserName' | 'AvaterHash' = 'UserName'

    waitResponse: boolean = false

    newPassword: string = ''
    newUserName: string = ''
    newAvaterHash: string = ''
    emailCode: string = ''

    errors: string = ''


    reset() {
        this.newUserName = ''
        this.newPassword = ''
        this.newAvaterHash = ''
        this.emailCode = ''
        this.waitResponse = false
    }

    sendUpdateUserInfo() {
        switch (this.updateType) {
            case 'UserName':
                if (this.newUserName === userStore.getUser(authStore.userId).showName) break
                if (this.newUserName === '') {
                    this.errors = '用户名不能为空'
                    break
                }
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'UserName',
                    newName: this.newUserName,
                })
                break
            case 'AvaterHash':
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'AvaterHash',
                    newHash: this.newAvaterHash,
                })
                break
            case 'Password':
                if (!passwordTester.test(this.newPassword)) {
                    this.errors = '密码格式错误: 请输入长度为8-20, 包含数字和字母的密码'
                    this.newPassword = ''
                    break
                }
                if (this.emailCode === '') {
                    this.errors = '验证码不能为空'
                    break
                }
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'Password',
                    newPassword: SHA256(this.newPassword + 'dmail' + authStore.email).toString(),
                    emailCode: parseInt(this.emailCode),
                })
                break
        }
        this.waitResponse = true
    }

    writeToStore() {
        switch (this.updateType) {
            case 'UserName':
                userStore.getUser(authStore.userId).setName(this.newUserName)
                LocalDatabase.saveUserInfo(authStore.userId, userStore.getUser(authStore.userId))
                this.newUserName = ''
                break
            case 'Password':
                authStore.password = this.newPassword
                this.newPassword = ''
                this.emailCode = ''
                authStore.logout()
                break
            case 'AvaterHash':
                userStore.getUser(authStore.userId).avaterHash = this.newAvaterHash
                LocalDatabase.saveUserInfo(authStore.userId, userStore.getUser(authStore.userId))
                this.newAvaterHash = ''
                break
        }
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.UpdateUserInfoResponse, this.updateUserInfoResponseHandler)
    }

    updateUserInfoResponseHandler(data: ReceiveUpdateUserInfoResponseData) {
        this.waitResponse = false
        switch (data.state) {
            case 'Success':
                modalStore.handleCancel()
                this.writeToStore()
                break
            case 'PasswordFormatError':
                this.errors = '密码格式错误'
                this.reset()
                break
            case 'UserNameFormatError':
                this.errors = '用户名格式错误'
                this.reset()
                break
            case 'AvaterPathFormatError':
                this.errors = '头像路径异常'
                this.reset()
                break
            case 'ServerError':
                this.errors = '服务器异常'
                this.reset()
                break
            case 'EmailCodeError':
                this.errors = '邮箱验证码错误'
                this.emailCode = ''
                break
        }
    }

    get showError() {
        return this.errors !== ''
    }
}

export const updateUserStore = new UpdateUserStore()
