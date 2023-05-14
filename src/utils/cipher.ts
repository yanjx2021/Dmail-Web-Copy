import JSEncrypt from 'jsencrypt'
import { Buffer } from 'buffer'
import crypto from 'crypto'
const keypair = require('keypair')

export function sha256(message: any, secret = '', encoding: any) {
    const hmac = crypto.createHmac('sha256', secret)
    return hmac.update(message).digest(encoding)
}

export function getHash(message: any, encoding: any) {
    const hash = crypto.createHash('sha256')
    return hash.update(message).digest(encoding)
}

export function getDate(timestamp: any) {
    const date = new Date(timestamp * 1000)
    const year = date.getUTCFullYear()
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
    const day = ('0' + date.getUTCDate()).slice(-2)
    return `${year}-${month}-${day}`
}

export default class Crypto {
    key: any
    pubKey: any
    priKey: any
    sendKey: any
    hasAES = false
    secretKey: Uint8Array = Buffer.from('')
    iv = Buffer.from('dMailBackend')
    constructor() {
        this.key = keypair(1024)
        this.pubKey = this.key.public
        this.priKey = this.key.private
        this.sendKey = this.pubKey.slice(31, -30).replace(/[\r\n]/g, '')
    }
    encryptRSA(data: any) {
        const encrypt = new JSEncrypt()
        encrypt.setPublicKey(this.pubKey)
        return encrypt.encrypt(data)
    }
    decryptRSA(data: any): any {
        const decrypt = new JSEncrypt()
        decrypt.setPrivateKey(this.priKey)
        return decrypt.decrypt(data)
    }
    setSerectKey(key: any) {
        let array: any = []
        let buffer = Buffer.from(this.decryptRSA(key), 'base64')
        for (let i = 0; i < buffer.length; i++) {
            array[i] = buffer[i]
        }
        this.secretKey = Buffer.from(this.decryptRSA(key), 'base64')
        this.hasAES = true
        console.log('成功设置AES密钥')
    }
    encryptAES(word: any) {
        if (typeof word !== 'string') {
            word = JSON.stringify(word)
        }
        const cipher = crypto.createCipheriv('aes-128-gcm', this.secretKey, this.iv)
        const encrypted = cipher.update(word, 'utf8')
        const end = cipher.final()
        const tag = cipher.getAuthTag()
        const res = Buffer.concat([encrypted, end, tag])
        return res.toString('base64')
    }
    decryptAES(data: any) {
        let bData = Buffer.from(data, 'base64')
        const tag = bData.slice(-16)
        const cdata = bData.slice(0, bData.length - 16)
        const decipher = crypto.createDecipheriv('aes-128-gcm', this.secretKey, this.iv)
        decipher.setAuthTag(tag)
        let msg = decipher.update(cdata)
        const fin = decipher.final()
        const decryptedStr = new TextDecoder('utf8').decode(Buffer.concat([msg, fin]))
        return decryptedStr
    }
}

export const myCrypto = new Crypto()
