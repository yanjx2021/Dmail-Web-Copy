import JSEncrypt from 'jsencrypt'
import { Buffer } from 'buffer'
import crypto from 'crypto'
const keypair = require('keypair')

export default class Crypto {
    key = keypair(1024)
    pubKey = this.key.public
    priKey = this.key.private
    hasAES = false
    secretKey: any = '37MmOADe+OYXuMSy'
    iv = Buffer.from('dMailBackend')
    constructor() {}
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
        this.secretKey = Buffer.from(this.decryptRSA(key), 'utf-8')
        this.hasAES = true
    }
    encryptAES(word: any) {
        if (typeof word !== 'string') {
            word = JSON.stringify(word)
        }
        const cipher = crypto.createCipheriv('aes-128-gcm', this.secretKey, this.iv)
        const encrypted = cipher.update(word, 'utf8')
        const end = cipher.final()
        const tag = cipher.getAuthTag()
        const res = Buffer.concat([this.iv, encrypted, end, tag])
        return res.toString('base64')
    }
    decryptAES(data: any) {
        let bData = Buffer.from(data, 'base64')
        const iv = bData.slice(0, 12)
        const tag = bData.slice(-16)
        const cdata = bData.slice(12, bData.length - 16)
        const decipher = crypto.createDecipheriv('aes-128-gcm', this.secretKey, iv)
        decipher.setAuthTag(tag)
        let msg = decipher.update(cdata)
        const fin = decipher.final()
        const decryptedStr = new TextDecoder('utf8').decode(Buffer.concat([msg, fin]))
        return decryptedStr
    }
}

const keyStr = 'uSoA4APNMk/yFbCz'
export const myCrypto = new Crypto()
