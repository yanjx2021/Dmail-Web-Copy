import { MessageSendData, Send, Receive, DataType } from './message'
import Crypto from './cipher'
import { AuthMethod, AuthState, authStore } from '../stores/authStore'
import { requestStore } from '../stores/requestStore'
import { action, runInAction } from 'mobx'

export const GetServerAddress = () => {
    const protocol = document.location.protocol
    if (protocol === 'http:') {
        return 'ws://' + document.location.host + '/ws'
    } else if (protocol === 'https:') {
        return 'wss://' + document.location.host + '/ws'
    } else {
        return ''
    }
}

// 43.143.134.180
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
    private websocket: WebSocket
    private cipher: Crypto
    private timer: any
    private timeout: number = 5000

    constructor() {
        this.websocket = this.createWebsocket()
        this.cipher = new Crypto()
    }

    temporaryShutDownHandler = action((ev: any) => {
        console.log(ev)
        this.clearHeartBeat()
        if (authStore.state === AuthState.Logged) {
            authStore.errors = '网络环境异常，请重新登录'
        }
        MessageServer.destroyInstance()
    })

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
        if (
            this.instance.websocket?.readyState === WebSocket.CLOSED ||
            this.instance.websocket?.readyState === WebSocket.CLOSING
        ) {
            this.instance.createWebsocket()
        }
        return this.instance
    }
    static destroyInstance() {
        this.instance?.clearHeartBeat()
        this.instance?.websocket.close()
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
    send<T extends Send>(...args: SendArgumentsType<T>) {
        if (this.websocket?.readyState !== this.websocket?.OPEN || !this.cipher.hasAES) {
            setTimeout(() => {
                this.send<T>(...args)
            }, 50)
        } else {
            const [command, data]: [T, MessageSendData[T]] | [T] = args
            
            if (command !== Send.Ping) {
                console.log('Send', {
                    command,
                    data,
                })
            }

            this.websocket?.send(
                this.cipher.encryptAES({
                    command,
                    data,
                })
            )
        }
    }

    private createWebsocket() {
        const server_address = GetServerAddress()
        console.log(`尝试连接至${server_address}`)
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
        websocket.onerror = this.temporaryShutDownHandler
        websocket.onclose = this.temporaryShutDownHandler

        return websocket
    }
}
