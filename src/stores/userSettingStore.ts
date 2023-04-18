import { makeAutoObservable } from "mobx"
import { MessageServer } from "../utils/networkWs"
import { Receive, ReceiveSetUserSettingResponseData, Send } from "../utils/message"
import { userStore } from "./userStore"
import { LocalDatabase } from "./localData"
import { secureAuthStore } from "./secureAuthStore"


export interface UserSetting {
    secondaryCheckChats: [number, string][] // 保存需要进行二次验证的chatid
    userNickname: [number, string][] // [userId, nickname]格式存储用户昵称
}

export class UserSettingStore {
    userSetting: UserSetting = {
        secondaryCheckChats: [],
        userNickname: []
    }
    errors: string = ''
    constructor() {
        makeAutoObservable(this, {}, {autoBind: true})
        MessageServer.on(Receive.UserSetting, this.ReceiveUserSettingHandler)
        MessageServer.on(Receive.SetUserSettingResponse, this.UserSettingResponseHandler)
    }

    reset() {
        this.userSetting = {
            secondaryCheckChats: [],
            userNickname: []
        }
    }

    UserSettingResponseHandler(data: ReceiveSetUserSettingResponseData) {
        if (data.state === 'Success') {
            LocalDatabase.saveUserSetting(JSON.stringify(this.userSetting))
        }
    }

    ReceiveUserSettingHandler(content: string) {
        try {
            if (content === '') return
            const userSetting = JSON.parse(content)
            LocalDatabase.saveUserSetting(content)
            this.setUserSetting(userSetting)
        } catch (error) {
            console.error(error)
        }
    }

    setUserSetting(userSetting: UserSetting) {
        this.userSetting = userSetting
        this.initialDistribute()
    }

    initialDistribute() {
        this.userSetting.userNickname.forEach(([userId, nickname]) => {
            userStore.setUserNickname(userId, nickname)
        })
        this.userSetting.secondaryCheckChats.forEach(([chatId, _]) => {
            secureAuthStore.setVerifyState(chatId, false)
        })
        //TODO
    }

    getSecondaryCode(chatId: number) {
        return this.userSetting.secondaryCheckChats.find(([chat, code]) => chat === chatId)?.[1]
    }

    sendUserSetting() {
        MessageServer.Instance().send<Send.SetUserSetting>(Send.SetUserSetting, JSON.stringify(this.userSetting))
    }

    setChatVerify(chatId: number, code: string) {
        const chatTupleIndex = this.userSetting.secondaryCheckChats.findIndex(([chat, _]) => {
            return chat === chatId
        })
        if (chatTupleIndex === -1) {
            if (code === '') {
                return
            }
            this.userSetting.secondaryCheckChats.push([chatId, code])
        } else {
            if (code === '') {
                this.userSetting.secondaryCheckChats.splice(chatTupleIndex, 1)
                secureAuthStore.clearVerify(chatId)
                this.sendUserSetting()
                return
            } else {
                this.userSetting.secondaryCheckChats[chatTupleIndex][1] = code
            }
        }

        secureAuthStore.setVerifyState(chatId, false)
        this.sendUserSetting()
    }

    setUserNickName(userId: number, nickname: string) { // nickname为空表示删除备注
        const userNicknameTupleIndex = this.userSetting.userNickname.findIndex(([user, _]) => {
            return user === userId
        })
        if (userNicknameTupleIndex === -1) {
            if (nickname === '') {
                return
            }
            this.userSetting.userNickname.push([userId, nickname])
        } else {
            if (nickname === '') {
                this.userSetting.userNickname.splice(userNicknameTupleIndex, 1)
            } else {
                this.userSetting.userNickname[userNicknameTupleIndex][1] = nickname
            }
        }
        userStore.setUserNickname(userId, nickname)
        this.sendUserSetting()
    }
}

export const userSettingStore = new UserSettingStore()