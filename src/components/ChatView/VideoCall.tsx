import { observer } from 'mobx-react-lite'
import { rtcStore } from '../../stores/rtcStore'
import { RefObject, useEffect, useRef, useState } from 'react'
import { off } from 'process'
import { action } from 'mobx'
import '../../styles/VideoCall.css'
import { useImmer } from 'use-immer'

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
                            title="结束视频">
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

                    <p> {rtcStore.state}</p>
                    <div>
                        <p>好友id: </p>
                        <input
                            value={friendId}
                            onChange={(e) => {
                                const input = e.target.value.replace(/[^0-9]/g, '')
                                setFriendId(input)
                            }}></input>
                    </div>

                    <button
                        onClick={action(() => {
                            rtcStore.startMediaCall(parseInt(friendId), 'Video')
                        })}>
                        {' '}
                        发送视频通话请求{' '}
                    </button>

                    <button onClick={rtcStore.approvedUnsolvedOffer}>接受视频通话请求</button>
                </div>
            </div>
        </div>
    )
})