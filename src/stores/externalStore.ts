import axios from 'axios'

import { makeAutoObservable, runInAction } from 'mobx'
import SparkMD5 from 'spark-md5'
import { LocalDatabase } from './localData'
import { ChatMessage, chatStore } from './chatStore'
import { authStore } from './authStore'

const baiduTranslateUrl = '/baiduTranslate'
const baiduVoiceTranslateUrl = '/baiduVoice'

export class ExternalApiStore {
    baiduTranslateId: string = ''
    baiduTransalteKey: string = ''

    baiduAiToken: string = ''

    constructor() {
        makeAutoObservable(this)
    }

    load() {
        LocalDatabase.loadExternal().then((opt) => {
            if (!opt) return
            this.baiduTransalteKey = opt.baiduTransalteKey
            this.baiduTranslateId = opt.baiduTranslateId
            this.baiduAiToken = opt.baiduAiToken
        })
    }

    save() {
        LocalDatabase.saveExternal()
    }

    translateByBaidu(msg: ChatMessage, text: string, to = 'zh') {
        const salt = Date.now().toString()
        const sign = SparkMD5.hash(this.baiduTranslateId + text + salt + this.baiduTransalteKey)
        const params = {
            q: text,
            from: 'auto',
            to: to,
            salt: salt,
            appid: this.baiduTranslateId,
            sign: sign,
        }
        msg.translatedText = '正在翻译'
        axios
            .get(baiduTranslateUrl, { params })
            .then((res) => {
                runInAction(() => {
                    if (res.data.trans_result) {
                        msg.translatedText = res.data.trans_result[0].dst
                    } else {
                        msg.translatedText = '翻译失败'
                        console.error('翻译失败 ' + res)
                    }
                })
            })
            .catch((err) => {
                console.error(err)
            })
    }

    audioTranslateByBaidu(msg: ChatMessage, base64: string, size: number) {
        const params = {
            format: 'wav',
            rate: 16000,
            channel: 1,
            cuid: 'dmail1111111111',
            token: this.baiduAiToken,
            speech: base64,
            len: size,
        }
        msg.translatedText = '正在转换'
        axios
            .post(baiduVoiceTranslateUrl, { ...params })
            .then((res) => {
                runInAction(() => {
                    console.log(res)
                    if (res.data.result) {
                        msg.translatedText = res.data.result[0]
                    } else {
                        msg.translatedText = '转换失败'
                        console.error('翻译失败 ' + res)
                    }
                })
            })
            .catch((err) => {
                console.error(err)
            })
    }
}

export const externalStore = new ExternalApiStore()
