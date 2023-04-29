import React, { Component } from 'react'
import AudioAnalyser from './AudioAnalyser'

export interface AudioRecorderState {
    status: string
}

export class AudioRecorder extends Component<any, AudioRecorderState> {
    constructor(props: any) {
        super(props)
        this.state = {
            status: '',
        }
    }

    componentDidMount() {}

    controlAudio(status: any) {
        this.setState({
            status,
        })
    }

    render() {
        const { status } = this.state
        const audioProps = {
            audioType: 'audio/wav',
            // audioOptions: {sampleRate: 30000}, // 设置输出音频采样率
            status,
            timeslice: 1000, // timeslice（https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start#Parameters）
            startCallback: (e: any) => {
                console.log('succ start', e)
            },
            pauseCallback: (e: any) => {
                console.log('succ pause', e)
            },
            stopCallback: (e: any) => {
                // this.setState({
                //     audioSrc: window.URL.createObjectURL(e),
                // })
                console.log('succ stop', e)
            },
            onRecordCallback: (e: any) => {
                console.log('recording', e)
            },
            errorCallback: (err: any) => {
                console.log('error', err)
            },
        }
        return (
            <div>
                <AudioAnalyser {...audioProps}>
                    <div className="btn-box">
                        {status !== 'recording' && (
                            <button title="开始" onClick={() => this.controlAudio('recording')}>
                                开始
                            </button>
                        )}
                        {status === 'recording' && (
                            <button title="暂停" onClick={() => this.controlAudio('paused')}>
                                暂停
                            </button>
                        )}
                        <button title="停止" onClick={() => this.controlAudio('inactive')}>
                            停止
                        </button>
                        <button title="结束" onClick={() => this.controlAudio('')}>
                            结束
                        </button>
                    </div>
                </AudioAnalyser>
            </div>
        )
    }
}
