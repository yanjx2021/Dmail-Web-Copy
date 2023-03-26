import JSEncrypt from "jsencrypt"
const keypair = require('keypair')

export default class Crypto {
    key = keypair(1024)
    pubKey = this.key.public
    priKey = this.key.private
}

export const crypto = new Crypto()

