import { makeAutoObservable } from 'mobx'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveUpdateUserInfoResponseData, Send } from '../utils/message'
import { userStore } from './userStore'
import { authStore } from './authStore'
import { LocalDatabase } from './localData'

export class UpdateUserStore {
    updateType: 'Password' | 'UserName' | 'AvaterPath' = 'UserName'

    newPassword: string = ''
    newUserName: string = ''
    newAvaterPath: string = ''
    emailCode: string = ''

    errors: string = ''


    reset() {
        this.newUserName = ''
        this.newPassword = ''
        this.newAvaterPath = ''
    }

    sendUpdateUserInfo() {
        switch (this.updateType) {
            case 'UserName':
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'UserName',
                    newName: this.newUserName,
                })
                break
            case 'AvaterPath':
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'AvaterPath',
                    newPath: this.newAvaterPath,
                })
                break
            case 'Password':
                MessageServer.Instance().send<Send.UpdateUserInfo>(Send.UpdateUserInfo, {
                    type: 'Password',
                    newPassword: this.newPassword,
                    emailCode: parseInt(this.emailCode),
                })
                break
        }
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
                break
            case 'AvaterPath':
                userStore.getUser(authStore.userId).avaterPath = this.newAvaterPath
                LocalDatabase.saveUserInfo(authStore.userId, userStore.getUser(authStore.userId))
                this.newAvaterPath = ''
                break
        }
    }

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.UpdateUserInfoResponse, this.updateUserInfoResponseHandler)
    }

    updateUserInfoResponseHandler(data: ReceiveUpdateUserInfoResponseData) {
        switch (data.state) {
            case 'Success':
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
        }
    }
}

export const updateUserStore = new UpdateUserStore()
