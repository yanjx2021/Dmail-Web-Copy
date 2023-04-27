import { observer } from 'mobx-react-lite'
import { RtcState, rtcStore } from '../../stores/rtcStore'
import { RefObject, useEffect, useRef, useState } from 'react'
import { off } from 'process'
import { action } from 'mobx'
import '../../styles/VideoCall.css'
import { useImmer } from 'use-immer'
import { Button, Space, notification } from 'antd'
import { userStore } from '../../stores/userStore'

export enum StreamVideoPlayerState {
    Waiting,
    Playing,
    Stopped,
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
        <video className="img-fluid rounded" ref={videoRef} autoPlay playsInline controls={false} />
    )
}

export const VideoCall = observer(() => {
    const [friendId, setFriendId] = useImmer<string>('')
    const [viewSwap, setViewSwap] = useState(false)

    return (
        <div className="d-flex justify-content-left align-items-top h-100 text-center py-2">
            <div className="container-xxl">
                <div className="video-div overflow-hidden position-relative">
                    <div className="video-action-btn position-absolute p-2 rounded">
                        <button
                            type="submit"
                            className="btn btn-sm btn-default"
                            data-toggle="tooltip"
                            title="静音">
                            <i className="zmdi zmdi-mic-off"></i>
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-default"
                            data-toggle="tooltip"
                            title="录屏">
                            <i className="zmdi zmdi-dot-circle"></i>
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-danger"
                            data-toggle="tooltip"
                            title="结束视频"
                            onClick={() => {
                                rtcStore.closeMediaCall()
                            }}>
                            <i className="zmdi zmdi-phone"></i>
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-default"
                            data-toggle="tooltip"
                            title="屏幕共享">
                            <i className="zmdi zmdi-desktop-mac"></i>
                        </button>
                        <button
                            type="submit"
                            onClick={() => {
                                setViewSwap(!viewSwap)
                            }}
                            className="btn btn-sm btn-default"
                            data-toggle="tooltip"
                            title="翻转">
                            <i className="zmdi zmdi-videocam-switch"></i>
                        </button>
                    </div>
                    <div className="my-video position-absolute rounded overflow-hidden border">
                        <StreamVideoPlayer
                            stream={viewSwap ? rtcStore.remoteStream : rtcStore.localStream}
                            state={StreamVideoPlayerState.Waiting}
                        />
                    </div>

                    <StreamVideoPlayer
                        stream={viewSwap ? rtcStore.localStream : rtcStore.remoteStream}
                        state={StreamVideoPlayerState.Waiting}
                    />

                    <p> {rtcStore.rtcStateTip}</p>
                </div>
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
