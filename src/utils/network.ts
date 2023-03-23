import {
    MessageSendData,
    MessageBody,
    Send,
    MessageReceiveData,
    Receive,
    DataType,
} from './message'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import { filter, Observable, Subject, map } from 'rxjs'

export type Callback = (e: Event) => void
export type MessageCallback = (msg: DataType<Receive>) => void

type ArgumentsType<T> = T extends (...args: infer U) => void ? U : never;
type SendArgumentsType<T extends keyof MessageSendData> = 
    MessageSendData[T] extends never 
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
    ws!: WebSocketSubject<MessageBody<Receive | Send>>
    received$ = new Subject<MessageBody<Receive>>()
    url: string = ""

    constructor(_url: string) {
        super()
        this.url = _url
    }
    connect(): void {
        if (!this.url) {
            throw new Error('地址不存在，无法建立通道')
        }
        this.ws = webSocket({
            url: this.url,
        })
        super.reset().start(() => {
            this.send<Send.Ping>(Send.Ping)
        })
        this.ws.subscribe((data) => {
            this.received$.next(data as MessageBody<Receive>)
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
        
        this.ws.next({
            command,
            data
        })
        console.log({command, data})
    }
}

