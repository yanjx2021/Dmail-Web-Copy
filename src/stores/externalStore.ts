import axios from 'axios'

import { makeAutoObservable, runInAction } from 'mobx'
import SparkMD5 from 'spark-md5'
import { LocalDatabase } from './localData'
import { ChatMessage, chatStore } from './chatStore'

const baiduTranslateUrl = '/baiduTranslate'

export class ExternalApiStore {
    baiduTranslateId: string = ''
    baiduTransalteKey: string = ''

    constructor() {
        makeAutoObservable(this)
    }

    load() {
        LocalDatabase.loadExternal().then((opt) => {
            if (!opt) return
            this.baiduTransalteKey = opt.baiduTransalteKey
            this.baiduTranslateId = opt.baiduTranslateId
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
}

export const externalStore = new ExternalApiStore()
