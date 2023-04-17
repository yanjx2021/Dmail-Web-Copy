import { SHA256 } from "crypto-js"



export const secondaryCodeHash = (code: string) => {
    return SHA256('tombDisco' + code + 'dmail').toString() 
}