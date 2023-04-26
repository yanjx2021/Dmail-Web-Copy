import { observer } from 'mobx-react-lite'
import { rtcStore } from '../stores/rtcStore'
import { RefObject, useEffect, useRef, useState } from 'react'
import { off } from 'process'
import { action } from 'mobx'

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

    return <video ref={videoRef} autoPlay playsInline controls={false} />
}

export const RtcTest = observer(() => {
    const [friendId, setFriendId] = useState(1)

    return (
        <div className="App">
            <p> {rtcStore.state}</p>
            <div>
                <p>本地视频</p>
                <StreamVideoPlayer
                    stream={rtcStore.localStream}
                    state={StreamVideoPlayerState.Waiting}
                />
            </div>

            <div>
                <p>远程视频</p>
                <StreamVideoPlayer
                    stream={rtcStore.remoteStream}
                    state={StreamVideoPlayerState.Waiting}
                />
            </div>

            <div>
                <p>好友id：</p>
                <input
                    value={friendId}
                    onChange={(e) => {
                        setFriendId(Number(e.target.value))
                    }}></input>
            </div>

            <button
                onClick={action(() => {
                    rtcStore.startMediaCall(friendId, 'Video')
                })}>
                {' '}
                发送视频通话请求{' '}
            </button>

            <button onClick={rtcStore.approvedUnsolvedOffer}>接受视频通话请求</button>
        </div>
    )
})
