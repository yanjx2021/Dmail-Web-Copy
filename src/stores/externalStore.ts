import axios from 'axios'

import { makeAutoObservable, runInAction } from 'mobx'
import SparkMD5 from 'spark-md5'
import { LocalDatabase } from './localData'
import { ChatMessage, chatStore } from './chatStore'
import { authStore } from './authStore'
import crypto from 'crypto'
import { getHash, sha256 } from '../utils/cipher'
import { message } from 'antd'

const baiduTranslateUrl = '/baiduTranslate'
const baiduVoiceTranslateUrl = '/baiduVoice'
const tencentCloudUrl = '/tencentCloud'

export class ExternalApiStore {
    baiduTranslateId: string = ''
    baiduTransalteKey: string = ''

    baiduAiToken: string = ''

    tencentCloudId: string = ''
    tencentCloudKey: string = ''

    constructor() {
        makeAutoObservable(this)
    }

    load() {
        LocalDatabase.loadExternal().then((opt) => {
            if (!opt) return
            this.baiduTransalteKey = opt.baiduTransalteKey
            this.baiduTranslateId = opt.baiduTranslateId
            this.baiduAiToken = opt.baiduAiToken
            this.tencentCloudId = opt.tencentCloudId
            this.tencentCloudKey = opt.tencentCloudKey
        })
    }

    save() {
        LocalDatabase.saveExternal()
    }

    translateByBaidu(msg: ChatMessage, text: string, to = 'zh') {
        if (this.baiduTransalteKey === '' || this.baiduTranslateId === '') {
            message.error('未配置百度翻译外部服务')
            return
        }

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

    audioTranslateByTencent(msg: ChatMessage, base64: string, size: number) {
        if (this.tencentCloudId === '' || this.tencentCloudKey === '') {
            message.error('未配置腾讯云语音转换外部服务')
            return
        }

        const params = {
            EngSerViceType: '16k_zh',
            SourceType: 1,
            VoiceFormat: 'wav',
            SubServiceType: 2,
            Data: base64,
            DataLen: size,
            WordInfo: 0,
        }

        const payload = JSON.stringify(params)

        console.log(this.tencentCloudId)
        console.log(this.tencentCloudKey)

        const SECRET_ID = this.tencentCloudId
        const SECRET_KEY = this.tencentCloudKey

        const endpoint = 'asr.tencentcloudapi.com'
        const service = 'asr'
        const action = 'SentenceRecognition'
        const version = '2019-06-14'
        const timestamp = Math.trunc(Date.now() / 1000)
        const date = this.getDate(timestamp)

        const hashedRequestPayload = getHash(payload, 'hex')
        const httpRequestMethod = 'POST'
        const canonicalUri = '/'
        const canonicalQueryString = ''
        const canonicalHeaders =
            'content-type:application/json; charset=utf-8\n' +
            'host:' +
            endpoint +
            '\n' +
            'x-tc-action:' +
            action.toLowerCase() +
            '\n'
        const signedHeaders = 'content-type;host;x-tc-action'

        const canonicalRequest =
            httpRequestMethod +
            '\n' +
            canonicalUri +
            '\n' +
            canonicalQueryString +
            '\n' +
            canonicalHeaders +
            '\n' +
            signedHeaders +
            '\n' +
            hashedRequestPayload

        const algorithm = 'TC3-HMAC-SHA256'
        const hashedCanonicalRequest = getHash(canonicalRequest, 'hex')
        const credentialScope = date + '/' + service + '/' + 'tc3_request'
        const stringToSign =
            algorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hashedCanonicalRequest

        const kDate = sha256(date, 'TC3' + SECRET_KEY, undefined)
        const kService = sha256(service, kDate, undefined)
        const kSigning = sha256('tc3_request', kService, undefined)
        const signature = sha256(stringToSign, kSigning, 'hex')

        const authorization =
            algorithm +
            ' ' +
            'Credential=' +
            SECRET_ID +
            '/' +
            credentialScope +
            ', ' +
            'SignedHeaders=' +
            signedHeaders +
            ', ' +
            'Signature=' +
            signature

        msg.translatedText = '正在转换'

        axios
            .post(tencentCloudUrl, payload, {
                headers: {
                    Authorization: authorization,
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-TC-Action': 'SentenceRecognition',
                    'X-TC-Timestamp': timestamp.toString(),
                    'X-TC-Version': '2019-06-14',
                },
            })
            .then((res) => {
                runInAction(() => {
                    console.log(res)
                    if (res.data.Response.Result) {
                        msg.translatedText = res.data.Response.Result
                    } else {
                        msg.translatedText = '转换失败'
                        console.error('翻译失败 ' + res)
                    }
                })
            })
            .catch((err) => {
                runInAction(() => {
                    msg.translatedText = '转换失败'
                    console.error('翻译失败 ' + err)
                })
            })

        const curlcmd =
            'curl -X POST ' +
            'https://' +
            endpoint +
            ' -H "Authorization: ' +
            authorization +
            '"' +
            ' -H "Content-Type: application/json; charset=utf-8"' +
            ' -H "Host: ' +
            endpoint +
            '"' +
            ' -H "X-TC-Action: ' +
            action +
            '"' +
            ' -H "X-TC-Timestamp: ' +
            timestamp.toString() +
            '"' +
            ' -H "X-TC-Version: ' +
            version +
            '"' +
            " -d '" +
            payload +
            "'"
        console.log(curlcmd)
    }

    getDate(timestamp: number) {
        const date = new Date(timestamp * 1000)
        const year = date.getUTCFullYear()
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
        const day = ('0' + date.getUTCDate()).slice(-2)
        return `${year}-${month}-${day}`
    }

    sendTencentCloudRequest(params: any) {}
}

export const externalStore = new ExternalApiStore()
