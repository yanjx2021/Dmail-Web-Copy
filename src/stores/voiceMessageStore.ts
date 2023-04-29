import { makeAutoObservable } from 'mobx'

export enum VoiceRecorderState {
    None,
    Recording,
    Pause,
    Sending,
}

export class VoiceMessageStore {
    showVoiceFooter = false
    audioSrc: any

    state: VoiceRecorderState = VoiceRecorderState.None

    get analyserStatus() {
        switch (this.state) {
            case VoiceRecorderState.None:
                return ''
            case VoiceRecorderState.Pause:
                return 'paused'
            case VoiceRecorderState.Recording:
                return 'recording'
            case VoiceRecorderState.Sending:
                return ''
        }
        return ''
    }

    constructor() {
        makeAutoObservable(this)
    }
}

export const voiceMessageStore = new VoiceMessageStore()
