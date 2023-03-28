import {
    MessageSendData,
    MessageBody,
    Send,
    MessageReceiveData,
    Receive,
    DataType,
} from './message'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { filter, Observable, Subject, map, Subscription, catchError, of } from 'rxjs'
import Crypto from './cipher'
// import { cryptionRSA } from './cipher'

export type Callback = (e: Event) => void
export type MessageCallback = (msg: DataType<Receive>) => void

type ArgumentsType<T> = T extends (...args: infer U) => void ? U : never
type SendArgumentsType<T extends keyof MessageSendData> = MessageSendData[T] extends never
    ? ArgumentsType<(command: T) => void>
    : ArgumentsType<(command: T, data: MessageSendData[T]) => void>

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

export default class MessageServer extends Heart {
    ws!: WebSocketSubject<any>
    received$ = new Subject<MessageBody<Receive>>()
    subscriptions: Subscription = new Subscription()
    url: string = ''
    isConnect: boolean = false
    cipher = new Crypto()

    constructor(_url: string) {
        super()
        this.url = _url
        this.connect()
    }
    connect(): void {
        if (!this.url) {
            throw new Error('地址不存在，无法建立通道')
        }
        if (this.isConnect === false) {
            this.ws = webSocket({
                url: this.url,
            })
            this.ws
                .pipe(
                    catchError((error) => {
                        this.isConnect = false
                        return of(null)
                    })
                )
                .subscribe((data) => {
                    this.received$.next(data as MessageBody<Receive>)
                })
            this.isConnect = true
            this.send<Send.SetConnectionPubKey>(Send.SetConnectionPubKey, this.cipher.sendKey)
            this.addSubscription(
                this.receive(Receive.SetConnectionSymKey).subscribe((data) => {
                    console.log("start decrypt")
                    console.log(data)
                    this.cipher.setSerectKey(data)
                    console.log(this.cipher.secretKey)
                    console.log("end decrypt")
                    this.unSubscribe()
                })
            )
        } else {
            console.log('Has Connected')
        }
    }
    setHeart(): void {
        super.reset().start(() => {
            this.send<Send.Ping>(Send.Ping)
        })
    }

    receive<T extends Receive>(command: T): Observable<MessageReceiveData[T]> {
        return this.received$.pipe(
            filter((message) => message.command === command),
            map((message) => message.data)
        ) as Observable<MessageReceiveData[T]>
    }

    send<T extends Send>(...args: SendArgumentsType<T>) {
        const [command, data]: [T, MessageSendData[T]] | [T] = args
        if (this.cipher.hasAES) {
            // console.log(
            //     this.cipher.encryptAES({
            //         command,
            //         data,
            //     })
            // )        
            this.ws?.next(
                this.cipher.encryptAES({
                    command,
                    data,
                })
            )
        } else {
            // console.log({ command, data })
            this.ws?.next({
                command,
                data,
            })
        }
    }

    addSubscription(subscription: Subscription): void {
        this.subscriptions.add(subscription)
    }
    unSubscribe(): void {
        this.subscriptions.unsubscribe()
    }
}

export const messageServer = new MessageServer('ws://127.0.0.1:8080/ws')
