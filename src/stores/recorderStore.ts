import { makeAutoObservable } from 'mobx'
import Recorder from 'js-audio-recorder'
import { authStore } from './authStore'

export enum VoiceRecorderState {
    None,
    Recording,
    Pause,
    Sending,
}

export class RecorderStore {
    recorder: undefined | Recorder
    state: VoiceRecorderState
    sendVoiceMessageHandler: undefined | any
    showVoiceFooter = false

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        this.state = VoiceRecorderState.None
    }

    startRecord() {
        const config = {
            sampleBits: 16,
            sampleRate: 16000,
            numChannels: 1,
            compiling: false,
        }

        this.state = VoiceRecorderState.Recording
        this.recorder = new Recorder(config)

        this.recorder.start().then(() => {
            console.log('开始')
        })
    }

    stopAndSendRecord() {
        if (!this.recorder) {
            return
        }
        const blob = this.recorder.getWAVBlob()
        this.recorder.destroy()
        this.recorder = undefined
        this.state = VoiceRecorderState.Sending

        const file = new File(
            [blob],
            'voice-' + authStore.userId + '-' + Date.now().toString() + '.wav',
            { type: 'audio/wav' }
        )

        this.sendVoiceMessageHandler && this.sendVoiceMessageHandler(file)
    }
}

export const recorderStore: RecorderStore = new RecorderStore()
