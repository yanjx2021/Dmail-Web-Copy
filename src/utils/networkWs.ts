import { MessageSendData, Send, Receive, DataType } from './message'
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
    instance: null | WebSocket = null
    cipher = new Crypto()
    events: any = {}
    constructor() {
        super()
    }
    getInstance() {
        if (this.instance === null || this.instance.readyState === this.instance.CLOSED) {
            this.instance = new WebSocket('ws://43.143.134.180:8080/ws')
            this.instance.onmessage = (event) => {
                if (this.cipher.hasAES) {
                    console.log('Receive', this.cipher.decryptAES(event.data))
                    const data = JSON.parse(this.cipher.decryptAES(event.data))
                    try {
                        this.events[data.command as Receive](data.data)
                    } catch (error) {
                        console.log(data.command + ' Not defined')
                        console.log(error)
                    }
                } else {
                    console.log('Receive', JSON.parse(event.data))
                    const data = JSON.parse(event.data)
                    this.cipher.setSerectKey(data.data)
                }
            }
            this.instance.onopen = () => {
                this.instance?.send(
                    JSON.stringify({
                        command: Send.SetConnectionPubKey,
                        data: this.cipher.sendKey,
                    })
                )
            }
            this.instance.onerror = (ev) => {
                this.cipher = new Crypto()
                console.log(ev)
            }
            this.instance.onclose = (ev) => {
                this.cipher = new Crypto()
                console.log(ev)
            }
        }
        return this
    }
    sendAny(command: string, data: any) {
        console.log({
            command: command,
            data: data,
        })
        this.instance?.send(
            this.cipher.encryptAES({
                command: command,
                data: data,
            })
        )
    }
    send<T extends Send>(...args: SendArgumentsType<T>) {
        if (this.instance?.readyState !== this.instance?.OPEN || !this.cipher.hasAES) {
            setTimeout(() => {
                this.send<T>(...args)
            }, 50)
        } else {
            const [command, data]: [T, MessageSendData[T]] | [T] = args
            console.log('Send', {
                command,
                data,
            })
            this.instance?.send(
                this.cipher.encryptAES({
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
    reSet() {
        this.reset()
        this.instance?.close()
        this.instance = null
        if (this.cipher.hasAES) {
            this.cipher = new Crypto()
        }
    }
    resetSocket() {
        this.instance?.close()
        this.instance = new WebSocket('ws://43.143.134.180:8080/ws')
    }
}

export const messageServer = new MessageServer()
