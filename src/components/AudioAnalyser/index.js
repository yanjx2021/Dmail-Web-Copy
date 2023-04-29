/**
 * Created by j_bleach on 2018/8/1.
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WebWorker from './mp3worker.js'
import convertWav from './audioConvertWav'

export class AudioAnalyser extends Component {
    static renderProps = ['status', 'audioSrc']
    constraints = { audio: true }
    mp3Worker = new Worker(WebWorker)

    blobReceiver = (e) => {}

    constructor(props) {
        super(props)
        AudioAnalyser.compatibility()
        this.audioChunk = [] // 音频信息存储对象
        this.mediaRecorder = null // 媒体记录对象
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)() // 音频上下文
        this.analyser = this.audioCtx.createAnalyser()
        this.canvasRef = React.createRef() // react ref
        this.canvasCtx = null // canvas 上下文
        this.animationId = null
    }

    /**
     * @author j_bleach 2020/1/1
     * @describe ["status", "audioSrc"]判断是否渲染
     * @param props: object
     * @param nextProps: object
     * @param renderProps: array
     * @return boolean
     */
    static checkRender(props, nextProps, renderProps) {
        const keys = [...new Set(renderProps)]
        return keys.some((v) => props[v] !== nextProps[v])
    }

    shouldComponentUpdate(nextProps) {
        return AudioAnalyser.checkRender(this.props, nextProps, AudioAnalyser.renderProps)
    }

    componentDidUpdate(prevProps) {
        if (this.props.status !== prevProps.status) {
            const event = {
                inactive: this.stopAudio,
                recording: this.startAudio,
                paused: this.pauseAudio,
            }[this.props.status]
            event && event()
        }
    }

    audioProgress = () => {
        const audio = new Audio()
        audio.src = this.props.audioSrc
        const source = this.audioCtx.createMediaElementSource(audio)
        source.connect(this.analyser)
        // this.analyser.connect(this.audioCtx.destination);
        this.renderCurve()
    }

    render() {
        const { children, className, audioSrc } = this.props

        return (
            <div className={className}>
                <div>{this.renderCanvas()}</div>
                {children}
                {audioSrc && (
                    <div>
                        <audio
                            controls
                            src={audioSrc}
                            id={audioSrc.substring(audioSrc.length - 6)}
                        />
                    </div>
                )}
            </div>
        )
    }

    /**
     * @author j_bleach 2018/08/02 17:06
     * @describe 浏览器navigator.mediaDevices兼容性处理
     */
    static compatibility() {
        const promisifiedOldGUM = (constraints) => {
            // First get ahold of getUserMedia, if present
            const getUserMedia =
                navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                AudioAnalyser.checkAndExecFn(this.props ? this.props.errorCallback : null)
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
            }
            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject)
            })
        }

        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {}
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = promisifiedOldGUM
        }
    }

    /**
     * @author j_bleach 2018/8/19
     * @describe 验证函数，如果存在即执行
     * @param fn: function 被验证函数
     * @param e: object 事件对象 event object
     */
    static checkAndExecFn(fn, e) {
        typeof fn === 'function' && fn(e)
    }

    /**
     * @author j_bleach 2022/04/17
     * @describe 兼容safari
     * @returns mimeType
     */
    static mediaSupported() {
        // safari used to not support this
        // ...even if it supported media recorder
        if (!MediaRecorder.isTypeSupported) {
            return 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            return 'audio/webm'
        } else {
            return 'audio/mp4'
        }
    }

    /**
     * @author j_bleach 2018/8/19
     * @describe 音频流转blob对象
     * @param type: string 音频的mime-type
     * @param cb: function 录音停止回调
     */
    audioStream2Blob(type, audioOptions, cb) {
        let wavBlob = null
        const chunk = this.audioChunk
        const audioWav = () => {
            let fr = new FileReader()
            fr.readAsArrayBuffer(new Blob(chunk, { type }))
            let frOnload = (e) => {
                const buffer = e.target.result
                this.audioCtx.decodeAudioData(buffer).then((data) => {
                    wavBlob = new Blob([new DataView(convertWav(data, audioOptions))], {
                        type: 'audio/wav',
                    })
                    AudioAnalyser.checkAndExecFn(cb, wavBlob)
                })
            }
            fr.onload = frOnload
        }
        const audioMp3 = () => {
            let fr = new FileReader()
            fr.readAsArrayBuffer(new Blob(chunk, { type: 'audio/wav' }))
            let frOnload = (e) => {
                const buffer = e.target.result
                this.audioCtx.decodeAudioData(buffer).then((data) => {
                    const wavBuf = convertWav(data, audioOptions)
                    this.mp3Worker.postMessage({
                        cmd: 'init',
                        config: { bitRate: 128 },
                    })
                    this.mp3Worker.postMessage({ cmd: 'encode', rawInput: wavBuf })
                    this.mp3Worker.postMessage({ cmd: 'finish' })

                    this.mp3Worker.onmessage = (e) => {
                        if (e.data.cmd == 'end') {
                            const mp3Blob = new Blob(e.data.buf, { type })
                            AudioAnalyser.checkAndExecFn(cb, mp3Blob)
                        }
                    }
                })
            }
            fr.onload = frOnload
        }
        switch (type) {
            case 'audio/webm':
            case 'audio/mp4':
                AudioAnalyser.checkAndExecFn(
                    cb,
                    new Blob(chunk, { type: AudioAnalyser.mediaSupported() })
                )
                break
            case 'audio/wav':
                audioWav()
                break
            case 'audio/mp3':
                audioMp3()
                break
            default:
                return void 0
        }
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe 开始录音
     */
    startAudio = () => {
        const recorder = this.mediaRecorder
        if (!recorder || (recorder && recorder.state === 'inactive')) {
            navigator.mediaDevices
                .getUserMedia(this.constraints)
                .then((stream) => {
                    this.recordAudio(stream)
                })
                .catch((err) => {
                    AudioAnalyser.checkAndExecFn(this.props.errorCallback, err)
                    // throw new Error("getUserMedia failed:", err);
                })
            return false
        }
        if (recorder && recorder.state === 'paused') {
            this.resumeAudio()
        }
    }
    /**
     * @author j_bleach 2018/8/19
     * @describe 暂停录音
     */
    pauseAudio = () => {
        const recorder = this.mediaRecorder
        if (recorder && recorder.state === 'recording') {
            recorder.pause()
            recorder.onpause = () => {
                AudioAnalyser.checkAndExecFn(this.props.pauseCallback)
            }
            this.audioCtx.suspend()
        }
    }
    /**
     * @author j_bleach 2018/8/18
     * @describe 停止录音
     */
    stopAudio = () => {
        const { audioType, audioOptions } = this.props
        const recorder = this.mediaRecorder
        if (recorder && ['recording', 'paused'].includes(recorder.state)) {
            console.log('stop')
            recorder.stop()
            recorder.onstop = () => {
                this.audioStream2Blob(audioType, audioOptions, this.blobReceiver)
                this.audioChunk = [] // 结束后，清空音频存储
            }
            this.audioCtx.suspend()
            this.initCanvas()

            this.mediaRecorder.stream.getTracks()[0].stop()
            this.mediaRecorder = null
        }
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe mediaRecorder音频记录
     * @param stream: binary data 音频流
     */
    recordAudio(stream) {
        const { audioBitsPerSecond, timeslice } = this.props
        const mimeType = AudioAnalyser.mediaSupported()
        this.mediaRecorder = new MediaRecorder(stream, {
            audioBitsPerSecond,
            mimeType,
        })
        this.mediaRecorder.ondataavailable = (event) => {
            AudioAnalyser.checkAndExecFn(this.props.onRecordCallback, event.data)
            this.audioChunk.push(event.data)
        }
        this.audioCtx.resume()
        this.mediaRecorder.start(timeslice)
        this.mediaRecorder.onstart = (e) => {
            AudioAnalyser.checkAndExecFn(this.props.startCallback, e)
        }
        this.mediaRecorder.onresume = (e) => {
            this.initAudioAnalyser(stream)
            AudioAnalyser.checkAndExecFn(this.props.startCallback, e)
        }
        this.mediaRecorder.onerror = (e) => {
            AudioAnalyser.checkAndExecFn(this.props.errorCallback, e)
        }
        this.initAudioAnalyser(stream)
        this.renderCurve()
    }

    /**
     * @author j_bleach 2019/10/31
     * @describe 重置音频上下文（解决谷歌浏览器 音频数组链接断开问题）
     */

    initAudioAnalyser(stream) {
        this.analyser = this.audioCtx.createAnalyser()
        const source = this.audioCtx.createMediaStreamSource(stream)
        source.connect(this.analyser)
    }

    /**
     * @author j_bleach 2018/8/19
     * @describe 恢复录音
     */
    resumeAudio() {
        this.audioCtx.resume()
        this.mediaRecorder.resume()
    }

    componentDidMount() {
        this.initCanvas()
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationId) //组件销毁前，注销定时动画
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe canvas 配置
     */
    configCanvas() {
        const { height, width, backgroundColor, strokeColor } = this.props
        const canvas = this.canvasRef.current
        this.canvasCtx = canvas.getContext('2d')
        this.canvasCtx.clearRect(0, 0, width, height)
        this.canvasCtx.fillStyle = backgroundColor
        this.canvasCtx.fillRect(0, 0, width, height)
        this.canvasCtx.lineWidth = 2
        this.canvasCtx.strokeStyle = strokeColor
        this.canvasCtx.beginPath()
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe 画布初始化,停止动画
     */
    initCanvas() {
        window.cancelAnimationFrame(this.animationId)
        const { height, width } = this.props
        this.configCanvas()
        this.canvasCtx.moveTo(0, height / 2)
        this.canvasCtx.lineTo(width, height / 2)
        this.canvasCtx.stroke()
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe 动态绘制音频曲线
     */
    renderCurve = () => {
        const { height, width } = this.props
        this.animationId = window.requestAnimationFrame(this.renderCurve) // 定时动画
        const bufferLength = this.analyser.fftSize // 默认为2048
        const dataArray = new Uint8Array(bufferLength)
        // console.log("data",dataArray)
        this.analyser.getByteTimeDomainData(dataArray) // 将音频信息存储在长度为2048（默认）的类型数组（dataArray）
        this.configCanvas()
        const sliceWidth = Number(width) / bufferLength
        let x = 0
        this.canvasCtx.moveTo(x, height / 2)
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * height) / 2
            this.canvasCtx['lineTo'](x, y)
            x += sliceWidth
        }
        this.canvasCtx.lineTo(width, height / 2)
        this.canvasCtx.stroke()
    }

    /**
     * @author j_bleach 2018/8/18
     * @describe 初始化渲染canvas节点
     */
    renderCanvas() {
        const { height, width } = this.props
        return (
            <canvas
                ref={this.canvasRef}
                height={height}
                width={width}
                style={{ width: width, height: height }}
            />
        )
    }
}

AudioAnalyser.defaultProps = {
    status: '',
    audioSrc: '',
    backgroundColor: 'rgba(0, 0, 0, 1)',
    strokeColor: '#ffffff',
    className: 'audioContainer',
    audioBitsPerSecond: 128000,
    mimeType: 'audio/webm',
    audioType: 'audio/webm',
    audioOptions: {},
    width: 500,
    height: 100,
}
AudioAnalyser.propTypes = {
    status: PropTypes.string,
    audioSrc: PropTypes.string,
    backgroundColor: PropTypes.string,
    strokeColor: PropTypes.string,
    className: PropTypes.string,
    audioBitsPerSecond: PropTypes.number,
    audioType: PropTypes.string,
    audioOptions: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    timeslice: PropTypes.number,
    startCallback: PropTypes.func,
    pauseCallback: PropTypes.func,
    stopCallback: PropTypes.func,
    onRecordCallback: PropTypes.func,
}
export default AudioAnalyser
