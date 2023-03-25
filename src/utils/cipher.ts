import JSEncrypt from 'jsencrypt';

const NodeRSA = require('node-rsa')
export default class CryptionRSA {
    key = new NodeRSA({b: 1024})
    privateKey = this.key.exportKey('pkcs1-private-pem')
    publicKey = this.key.exportKey('pkcs1-public-pem')
    AesKey: any = null
    pubKey = new NodeRSA(this.publicKey, 'pkcs1-public')
    priKey = new NodeRSA(this.privateKey, 'pkcs1-private')
    encryptRSA(data: any) {
        return this.pubKey.encrypt(Buffer.from(JSON.stringify(data)), 'base64')
    }
    decryptRSA(data: any) {
        return this.priKey.decrypt(Buffer.from(data, 'base64')).toString()
    }
}

export const cryptionRSA = new CryptionRSA()





