import { observer } from 'mobx-react-lite'
import { RtcState, rtcStore } from '../../stores/rtcStore'
import { useEffect, useRef, useState } from 'react'
import '../../styles/VideoCall.css'
import { useImmer } from 'use-immer'
import { Button, Space, notification } from 'antd'
import { userStore } from '../../stores/userStore'

export enum StreamVideoPlayerState {
    Waiting,
    Playing,
    Stopped,
}

export const StreamAudioPlayer = ({
    stream,
    state,
}: {
    stream: MediaStream | null
    state: StreamVideoPlayerState
}) => {
    const audioRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <audio className="img-fluid rounded" ref={audioRef} autoPlay playsInline controls={false} />
    )
}

export const StreamVideoPlayer = ({
    stream,
    state,
}: {
    stream: MediaStream | null
    state: StreamVideoPlayerState
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <video ref={videoRef} autoPlay playsInline controls={false} />
    )
}

export const AudioCall = observer(() => {
    const [viewSwap, _] = useState(false)

    return (
        <div className="d-flex justify-content-center align-items-center h-100 text-center py-xl-4 py-md-3 py-2">
            <div className="container-xxl">
                <div className="avatar lg avatar-bg me-auto ms-auto mb-5">
                    <div className="avatar lg rounded-circle no-image">
                        <span>
                            <i className="zmdi zmdi-mic zmdi-hc-2x"></i>
                        </span>
                    </div>
                    <span className="a-bg-1"></span>
                    <span className="a-bg-2"></span>
                </div>
                <div className="mt-5">
                    <button
                        type="submit"
                        className="btn btn-sm btn-default"
                        data-toggle="tooltip"
                        title="静音">
                        <i className="zmdi zmdi-mic-off"></i>
                    </button>
                    <button
                        type="submit"
                        className="btn btn-sm btn-danger"
                        data-toggle="tooltip"
                        title="结束通话"
                        onClick={() => {
                            rtcStore.closeMediaCall()
                        }}>
                        <i className="zmdi zmdi-phone"></i>
                    </button>
                </div>
                <StreamAudioPlayer
                        stream={viewSwap ? rtcStore.localStream : rtcStore.remoteStream}
                        state={StreamVideoPlayerState.Waiting}
                    />
            </div>
        </div>
    )
})

export const MediaCallOfferNotification = () => {
    if (rtcStore.state === RtcState.WaitingUser && rtcStore.unsolvedOffer?.friendId) {
        const friendId = rtcStore.unsolvedOffer.friendId
        const duration = 15
        const timeout = setTimeout(() => {
            if (rtcStore.state === RtcState.WaitingUser) {
                rtcStore.refusedUnsolvedOffer()
            }
        }, duration * 1000)
        const btn = (
            <Space>
                <Button
                    onClick={() => {
                        rtcStore.approvedUnsolvedOffer()
                        clearTimeout(timeout)
                        notification.destroy()
                    }}>
                    同意
                </Button>
                <Button
                    onClick={() => {
                        rtcStore.refusedUnsolvedOffer()
                        clearTimeout(timeout)
                        notification.destroy()
                    }}>
                    拒绝
                </Button>
            </Space>
        )

        if (rtcStore.unsolvedOffer?.callType === 'Video') {
            notification.open({
                message: '视频通话请求',
                description: `好友${userStore.getUser(friendId).showName}邀请您进行视频通话`,
                key: friendId,
                btn,
                duration: duration,
                placement: 'bottomRight',
            })
        } else {
            notification.open({
                message: '语音通话请求',
                description: `好友${userStore.getUser(friendId).showName}邀请您进行语音通话`,
                key: friendId,
                btn,
                duration: duration,
                placement: 'bottomRight',
            })
        }
    }
}
