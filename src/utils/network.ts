import {
    MessageSendData,
    MessageBody,
    Send,
    MessageReceiveData,
    Receive,
    DataType,
} from './message'
import { filter, Observable, Subject, map, Subscription, catchError, of } from 'rxjs'
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

// export default class MessageServer extends Heart {
//     ws!: WebSocketSubject<any>
//     received$ = new Subject<MessageBody<Receive>>()
//     subscriptions: Subscription = new Subscription()
//     url: string = ''
//     isConnect: boolean = false
//     cipher = new Crypto()

//     constructor(_url: string) {
//         super()
//         this.url = _url
//         this.connect()
//     }
//     connect(): void {
//         if (!this.url) {
//             throw new Error('地址不存在，无法建立通道')
//         }
//         if (this.isConnect === false) {
//             this.ws = webSocket({
//                 url: this.url,
//             })
//             this.ws
//                 .pipe(
//                     catchError((error) => {
//                         this.isConnect = false
//                         return of(null)
//                     })
//                 )
//                 .subscribe((data) => {
//                     console.log(data)
//                     if (this.cipher.hasAES) {
//                         this.received$.next(JSON.parse(this.cipher.decryptAES(data)) as MessageBody<Receive>)
//                     } else {
//                         this.received$.next(data as MessageBody<Receive>)
//                     }
//                 })
//             this.isConnect = true
//             this.send<Send.SetConnectionPubKey>(Send.SetConnectionPubKey, this.cipher.sendKey)
//             this.addSubscription(
//                 this.receive(Receive.SetConnectionSymKey).subscribe((data) => {
//                     this.cipher.setSerectKey(data)
//                     this.unSubscribe()
//                 })
//             )
//         } else {
//             console.log('Has Connected')
//         }
//     }
//     setHeart(): void {
//         super.reset().start(() => {
//             this.send<Send.Ping>(Send.Ping)
//         })
//     }

//     receive<T extends Receive>(command: T): Observable<MessageReceiveData[T]> {
//         return this.received$.pipe(
//             filter((message) => message.command === command),
//             map((message) => message.data)
//         ) as Observable<MessageReceiveData[T]>
//     }

//     send<T extends Send>(...args: SendArgumentsType<T>) {
//         const [command, data]: [T, MessageSendData[T]] | [T] = args
//         if (this.cipher.hasAES) {
//             this.ws?.next(
//                 this.cipher.encryptAES({
//                     command,
//                     data,
//                 })
//             )
//         } else {
//             this.ws?.next({
//                 command,
//                 data,
//             })
//         }
//     }

//     addSubscription(subscription: Subscription): void {
//         this.subscriptions.add(subscription)
//     }
//     unSubscribe(): void {
//         this.subscriptions.unsubscribe()
//     }
// }

// export const messageServer = new MessageServer('ws://127.0.0.1:8080/ws')
export class MessageServer extends Heart {
    socket = new WebSocket('ws://127.0.0.1:8080/ws')
    cipher = new Crypto()
    received$ = new Subject<MessageBody<Receive>>()
    events: any = {}
    constructor() {
        super()
        this.socket.onmessage = (event) => {
            if (this.cipher.hasAES) {
                console.log('Receive', this.cipher.decryptAES(event.data))
                const data = JSON.parse(this.cipher.decryptAES(event.data))
                this.events[data.command as Receive](data.data)
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

    receive<T extends Receive>(command: T): Observable<MessageReceiveData[T]> {
        console.log('receive', command)
        return this.received$.pipe(
            filter((message) => message.command === command),
            map((message) => message.data)
        ) as Observable<MessageReceiveData[T]>
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
