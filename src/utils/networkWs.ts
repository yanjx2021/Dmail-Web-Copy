import {
    MessageSendData,
    Send,
    Receive,
    DataType,
} from './message'
import Crypto from './cipher'

export type Callback = (e: Event) => void
export type MessageCallback = (msg: DataType<Receive>) => void

type ArgumentsType<T> = T extends (...args: infer U) => void ? U : never
type SendArgumentsType<T extends keyof MessageSendData> = MessageSendData[T] extends never
    ? ArgumentsType<(command: T) => void>
    : ArgumentsType<(command: T, data: MessageSendData[T]) => void>


export interface Distributer {
    [Receive.Ping]: Function
    [Receive.Pong]: Function
    [Receive.Close]: Function
    [Receive.SetConnectionSymKey]: Function
    [Receive.SetConnectionPubKeyResponse]: Function
    [Receive.LoginResponse]: Function
    [Receive.RegisterResponse]: Function
    [Receive.SendMessageResponse]: Function
    [Receive.SendRequestResponse]: Function
    [Receive.SolveRequestResponse]: Function
    [Receive.PullResponse]: Function
    [Receive.Chat]: Function
    [Receive.Chats]: Function
    [Receive.Messages]: Function
    [Receive.Message]: Function
    [Receive.Request]: Function
    [Receive.Requests]: Function
    [Receive.UpdateRequest]: Function
    [Receive.UpdateMessage]: Function
}

export class Heart {
    heartTimeOut!: number
    serverHeartTimeOut!: number
    timeout: number = 5000
    reset() {
        clearTimeout(this.heartTimeOut)
        clearTimeout(this.serverHeartTimeOut)
        return this
    }
    start(cb: Callback) {
        this.heartTimeOut = setTimeout((e: Event) => {
            cb(e)
            this.serverHeartTimeOut = setTimeout((e: Event) => {
                cb(e)
                this.reset().start(cb)
            }, this.timeout)
        }, this.timeout)
    }
}

export class MessageServer extends Heart {
    socket = new WebSocket('ws://127.0.0.1:8080/ws')
    cipher = new Crypto()
    events: any = {}
    constructor() {
        super()
        this.socket.onmessage = (event) => {
            if (this.cipher.hasAES) {
                console.log('Receive', this.cipher.decryptAES(event.data))
                const data = JSON.parse(this.cipher.decryptAES(event.data))
                try {
                    this.events[data.command as Receive](data.data)
                } catch(error) {
                    console.log(error)
                }
            } else {
                const data = JSON.parse(event.data)
                this.cipher.setSerectKey(data.data)
            }
        }
        this.socket.onopen = (ev) => {
            this.send<Send.SetConnectionPubKey>(Send.SetConnectionPubKey, this.cipher.sendKey)
        }
        this.socket.onclose = (event) => {
            console.log(event)
        }
        this.socket.onerror = (event) => {
            console.log(event)
        }
    }

    send<T extends Send>(...args: SendArgumentsType<T>) {
        const [command, data]: [T, MessageSendData[T]] | [T] = args
        if (this.cipher.hasAES) {
            this.socket.send(
                this.cipher.encryptAES({
                    command,
                    data,
                })
            )
        } else {
            this.socket.send(
                JSON.stringify({
                    command,
                    data,
                })
            )
        }
    }
    on(command: Receive, callback: Function) {
        this.events[command] = callback
    }
    off(command: Receive) {
        this.events[command] = () => {
            console.log('handle of ' + command + 'has been off')
        }
    }
}

export const messageServer = new MessageServer()
