import { makeAutoObservable } from "mobx"
import { MessageServer } from "../utils/networkWs"
import { Receive, ReceiveSetUserSettingResponseData, Send } from "../utils/message"
import { userStore } from "./userStore"
import { LocalDatabase } from "./localData"


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
        //TODO
    }

    sendUserSetting() {
        MessageServer.Instance().send<Send.SetUserSetting>(Send.SetUserSetting, JSON.stringify(this.userSetting))
    }

    setSecondaryCheckChat(chatId: number, secondaryPassword: string) {
        const secondaryCheckTupleIndex = this.userSetting.secondaryCheckChats.findIndex(([_chatId, _]) => _chatId === chatId)
        if (secondaryCheckTupleIndex === -1) {
            if (secondaryPassword === '') return
            this.userSetting.secondaryCheckChats.push([chatId, secondaryPassword])
        } else {
            if (secondaryPassword === '') {
                this.userSetting.secondaryCheckChats.splice(secondaryCheckTupleIndex, 1)
            } else {
                this.userSetting.secondaryCheckChats[secondaryCheckTupleIndex][1] = secondaryPassword
            }
        }
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