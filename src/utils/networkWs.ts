import { MessageSendData, Send, Receive, DataType } from './message'
import Crypto from './cipher'

const server_address = "ws://43.143.134.180:8080/ws"

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

export class MessageServer {
    private static instance: MessageServer | null = null
    private static events: any = {}
    private websocket : WebSocket 
    private cipher : Crypto
    private timer: any
    private timeout: number = 8000
    
    constructor() {
        this.websocket = this.createWebsocket()
        this.cipher = new Crypto()
    }

    setHeartBeat(timeout: number) {
        this.timer = setInterval(() => {
            this.send<Send.Ping>(Send.Ping)
        }, timeout)
    }
    resetHeartBeat() {
        this.clearHeartBeat()
        this.setHeartBeat(this.timeout)
    }
    clearHeartBeat() {
        clearInterval(this.timer)
    }

    static Instance() {
        if (this.instance === null) {
            this.instance = new MessageServer()
        }
        if (this.instance.websocket?.readyState === WebSocket.CLOSED) {
            this.instance.createWebsocket()
        }
        return this.instance
    }
    static destroyInstance() {
        this.instance?.websocket.close()
        this.instance?.clearHeartBeat()
        this.instance = null
    }
    static on(command: Receive, callback: Function) {
        this.events[command] = callback
    }
    static off(command: Receive) {
        this.events[command] = () => {
            console.log('handle of ' + command + 'has been off')
        }
    }

    sendAny(command: string, data: any) {
        console.log({
            command: command,
            data: data,
        })
        this.websocket?.send(
            this.cipher.encryptAES({
                command: command,
                data: data,
            })
        )
    }

    send<T extends Send>(...args: SendArgumentsType<T>) {
        if (this.websocket?.readyState !== this.websocket?.OPEN || !this.cipher.hasAES) {
            setTimeout(() => {
                this.send<T>(...args)
            }, 50)
        } else {
            const [command, data]: [T, MessageSendData[T]] | [T] = args
            console.log('Send', {
                command,
                data,
            })
            this.websocket?.send(
                this.cipher.encryptAES({
                    command,
                    data,
                })
            )
        }
    }

    private createWebsocket() {
        const websocket = new WebSocket(server_address)

        websocket.onmessage = (event) => {
            try {
                if (this.cipher.hasAES) {
                    const data = JSON.parse(this.cipher.decryptAES(event.data))
                    console.log('Receive', data)
                    MessageServer.events[data.command as Receive](data.data)
                } else {
                    console.log('Receive', JSON.parse(event.data))
                    const data = JSON.parse(event.data)
                    this.cipher.setSerectKey(data.data)
                }
            } catch (error) {
                console.error(error)
            }
        }
        websocket.onopen = () => {
            this.websocket?.send(
                JSON.stringify({
                    command: Send.SetConnectionPubKey,
                    data: this.cipher.sendKey,
                })
            )
            this.setHeartBeat(this.timeout)
        }
        websocket.onerror = (ev) => {
            console.log(ev)
            this.clearHeartBeat()
        }
        websocket.onclose = (ev) => {
            console.log(ev)
            this.clearHeartBeat()
        }

        return websocket
    }
}
