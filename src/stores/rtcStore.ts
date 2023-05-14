import { action, makeAutoObservable, runInAction } from 'mobx'
import { off, traceDeprecation } from 'process'
import { MessageServer } from '../utils/networkWs'
import { MediaCallStop, MediaCallType, Receive, Send } from '../utils/message'
import { MediaCallAnswerData } from '../utils/message'
import { MediaCallData } from '../utils/message'
import { MediaIceCandidate } from '../utils/message'
import { UserId, authStore } from './authStore'
import { MediaCallOfferNotification } from '../components/ChatView/VideoCall'
import { chatStore } from './chatStore'
import { message } from 'antd'

export enum RtcState {
    None = 0,
    WaitingUser = 1,
    WaitngLocalStream = 2,
    WaitingAnswer = 3,
    WaitngCandidate = 4,
    Connecting = 5,
    Connected = 6,
}

export class RtcStore {
    localStream: MediaStream | null
    remoteStream: MediaStream | null

    peerConnection: RTCPeerConnection | undefined
    type: MediaCallType | undefined = undefined
    state: RtcState = RtcState.None

    remoteUserId: number | undefined

    unsolvedOffer: MediaCallData | undefined

    stashedCandidates: string[]

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })

        MessageServer.on(Receive.MediaCallAnswer, this.onReceiveMediaCallAnswer)
        MessageServer.on(Receive.MediaCallOffer, this.onReceiveMediaCallOffer)
        MessageServer.on(Receive.MediaIceCandidate, this.onReceiveMediaCandidate)
        MessageServer.on(Receive.MediaCallStop, this.onPeerCloseMediaCall)

        this.stashedCandidates = []
        this.localStream = null
        this.remoteStream = null
    }

    async startMediaCall(friendId: UserId, callType: MediaCallType) {
        this.remoteUserId = friendId
        const offer = await this.startPeerConnection(callType)
        this.type = callType
        runInAction(() => {
            MessageServer.Instance().send<Send.MediaCall>(Send.MediaCall, {
                friendId,
                callType,
                serializedOffer: JSON.stringify(offer),
            })
        })
    }

    get showMediaWindow() {
        return this.state >= 1
    }

    refusedUnsolvedOffer() {
        MessageServer.Instance().send<Send.MediaCallAnswer>(Send.MediaCallAnswer, {
            friendId: this.unsolvedOffer!.friendId,
            accept: false,
        })
        this.resetConnection()
    }

    async approvedUnsolvedOffer() {
        try {
            this.remoteUserId = this.unsolvedOffer!.friendId

            const offer = JSON.parse(this.unsolvedOffer!.serializedOffer)
            const answer = await this.receivePeerConnectionOffer(
                offer,
                this.unsolvedOffer!.callType
            )
            this.type = this.unsolvedOffer?.callType
            const chatId = chatStore.userToChat(this.unsolvedOffer!.friendId) as number | undefined

            if (!chatId) {
                // TODO : Throw Error
                console.error('没有找到ChatId')
                return
            }

            runInAction(() => {
                MessageServer.Instance().send<Send.MediaCallAnswer>(Send.MediaCallAnswer, {
                    friendId: this.remoteUserId!,
                    accept: true,
                    serializedAnswer: JSON.stringify(answer),
                })
            })

            chatStore.setActiveChatId && chatStore.setActiveChatId(chatId)
        } catch (error) {
            console.error(error)
        }
    }

    closeMediaCall() {
        if (this.remoteUserId) {
            MessageServer.Instance().send(Send.MediaCallStop, {
                friendId: this.remoteUserId,
                reason: 'User',
            })
        }
        this.resetConnection()
    }

    private onReceiveMediaCandidate(data: MediaIceCandidate) {
        if (data.friendId !== this.remoteUserId) {
            return
        }

        try {
            this.peerConnection?.addIceCandidate(JSON.parse(data.serializedCandidate))
        } catch (error) {
            console.log(error)
        }
    }

    private onPeerCloseMediaCall(data: MediaCallStop) {
        if (data.friendId !== this.remoteUserId) {
            return
        }

        message.info('对方挂断了通话')

        this.resetConnection()
    }

    private onReceiveMediaCallAnswer(data: MediaCallAnswerData) {
        if (data.friendId !== this.remoteUserId || this.state !== RtcState.WaitingAnswer) {
            return
        }

        if (!data.accept) {
            // 被拒绝
            message.success('通话请求被对方拒绝')
            this.resetConnection()
        } else {
            message.success('通话请求通过')
            try {
                this.receivePeerConnectionAnswer(JSON.parse(data.serializedAnswer!))
            } catch (error) {
                console.log(error)
            }
        }
    }

    private onReceiveMediaCallOffer(data: MediaCallData) {
        if (this.state !== RtcState.None) {
            this.refusedUnsolvedOffer()
        }

        this.unsolvedOffer = data
        this.state = RtcState.WaitingUser
        MediaCallOfferNotification()
    }

    private sendStashedCandidate() {
        console.log(this.stashedCandidates)
        this.stashedCandidates.forEach((serialized) => {
            MessageServer.Instance().send<Send.MediaIceCandidate>(Send.MediaIceCandidate, {
                friendId: this.remoteUserId!,
                serializedCandidate: serialized,
            })
        })
        this.stashedCandidates = []
    }

    private onFoundIceCandidate(event: any) {
        if (!event.candidate) {
            return
        }

        if (this.state < RtcState.WaitngCandidate) {
            this.stashedCandidates.push(JSON.stringify(event.candidate))
        } else {
            MessageServer.Instance().send<Send.MediaIceCandidate>(Send.MediaIceCandidate, {
                friendId: this.remoteUserId!,
                serializedCandidate: JSON.stringify(event.candidate),
            })
        }
    }

    private onReceiveRemoteTrack(event: any) {
        if (!event.streams) {
            return
        }
        const [stream] = event.streams
        this.remoteStream = stream
    }

    private onConnected() {
        this.state = RtcState.Connected
        message.success('通话连接成功')
    }

    private onConnecting() {
        this.state = RtcState.Connecting
        message.loading('通话正在连接')
    }

    private resetConnection() {
        this.state = RtcState.None
        this.type = undefined
        console.log('连接断开')
        this.localStream?.getTracks().forEach((track) => {
            track.stop()
        })
        this.localStream = null
        this.remoteStream?.getTracks().forEach((track) => {
            track.stop()
        })
        this.remoteStream = null
        this.peerConnection = undefined
        this.remoteUserId = undefined
        this.unsolvedOffer = undefined
        this.stashedCandidates = []
    }

    private onDisconnected() {
        this.resetConnection()
    }

    private onConnectionStateChange(event: any) {
        if (this.peerConnection?.connectionState === 'connected') {
            this.onConnected()
        } else if (this.peerConnection?.connectionState === 'connecting') {
            this.onConnecting()
        } else if (this.peerConnection?.connectionState === 'disconnected') {
            this.onDisconnected()
        }
    }

    get rtcStateTip() {
        switch (this.state) {
            case RtcState.None:
                return '没有进行通话'
            case RtcState.Connecting:
                return '正在连接'
            case RtcState.Connected:
                return '已连接'
            case RtcState.WaitingAnswer:
                return '等待对方回应'
            case RtcState.WaitingUser:
                return '等待确认'
            case RtcState.WaitngCandidate:
                return '正在连接'
            case RtcState.WaitngLocalStream:
                return '等待开启媒体设备'
        }
    }

    private createPeerConnection() {
        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: ['turn:dmail.r1ntaro.com:3478'],
                    username: 'dmail',
                    credential: 'dmailturn',
                },
            ],
            // iceTransportPolicy: "relay",
        }
        const peerConnection = new RTCPeerConnection(configuration)
        peerConnection.addEventListener('track', this.onReceiveRemoteTrack)
        peerConnection.addEventListener('connectionstatechange', this.onConnectionStateChange)
        peerConnection.addEventListener('icecandidate', this.onFoundIceCandidate)
        return peerConnection
    }

    private async getLocalStreamFromCamera(callType: MediaCallType) {
        if (!this.peerConnection) {
            console.error('需要先创建PeerConnection')
            return
        }

        try {
            const constraints =
                callType === 'Video' ? { video: true, audio: true } : { audio: true }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            runInAction(() => {
                this.localStream = stream

                this.localStream.getTracks().forEach(
                    action((track) => {
                        this.peerConnection?.addTrack(track, this.localStream!)
                    })
                )
            })
        } catch (error) {
            console.error('Error opening video camera.', error)
        }
    }

    private async startPeerConnection(callType: MediaCallType) {
        this.peerConnection = this.createPeerConnection()

        this.state = RtcState.WaitngLocalStream
        await this.getLocalStreamFromCamera(callType)

        runInAction(() => {
            this.state = RtcState.WaitingAnswer
        })

        const offer = await this.peerConnection.createOffer()
        await runInAction(async () => {
            await this.peerConnection!.setLocalDescription(offer)
        })

        return offer
    }

    private async receivePeerConnectionOffer(
        offer: RTCSessionDescriptionInit,
        callType: MediaCallType
    ) {
        this.peerConnection = this.createPeerConnection()

        this.state = RtcState.WaitngLocalStream
        await this.getLocalStreamFromCamera(callType)

        runInAction(() => {
            this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer))
        })

        const answer = await this.peerConnection.createAnswer()
        await runInAction(async () => {
            await this.peerConnection!.setLocalDescription(answer)
        })

        runInAction(() => {
            this.state = RtcState.WaitngCandidate
            this.sendStashedCandidate()
        })

        return answer
    }

    private receivePeerConnectionAnswer(answer: RTCSessionDescriptionInit) {
        this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer))
        this.state = RtcState.WaitngCandidate
        this.sendStashedCandidate()
    }
}

export const rtcStore = new RtcStore()
