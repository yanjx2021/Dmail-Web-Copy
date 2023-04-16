import { makeAutoObservable } from "mobx"
import { MessageServer } from "../utils/networkWs"
import { Receive, ReceivePullUserSettingResponseData, Send } from "../utils/message"
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
        MessageServer.on(Receive.PullUserSettingResponse, this.pullUserSettingResponseHandler)
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

    pullUserSettingResponseHandler(data: ReceivePullUserSettingResponseData) {
        switch (data.state) {
            case 'Success':
                this.userSetting = JSON.parse(data.content!)
                this.initialDistribute()
                break
            case 'ServerError':
                this.errors = '服务器异常'
                break
            case 'UserNotFound':
                this.errors = '找不到该用户'
                break
            default:
                this.errors = '数据异常'
        }
    }

    sendUserSetting() {
        MessageServer.Instance().send<Send.SendUserSetting>(Send.SendUserSetting, JSON.stringify(this.userSetting))
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
        LocalDatabase.saveUserSetting(JSON.stringify(this.userSetting))
        // this.sendUserSetting()
    }
}

export const userSettingStore = new UserSettingStore()