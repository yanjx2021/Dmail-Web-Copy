import JSEncrypt from "jsencrypt"
const keypair = require('keypair')

export default class Crypto {
    key = keypair(1024)
    pubKey = this.key.public
    priKey = this.key.private
    encrypter = new JSEncrypt()
    decrypterRSA = new JSEncrypt()
    constructor() {
        this.decrypterRSA.setPrivateKey(this.priKey)
    }
    decryptRSA(data: any) {
        return this.decrypterRSA.decrypt(data)
    }
}

export const crypto = new Crypto()

