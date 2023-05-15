import { useCallback, useEffect, useRef, useState } from 'react'
import '../../styles/ChatViewFooter.css'
import { messageSelectStore } from '../MessagesBox/Selector'
import { modalStore } from '../../stores/modalStore'
import { action } from 'mobx'
import { Mentions, Popover } from 'antd'
import { Chat } from '../../stores/chatStore'
import { useImmer } from 'use-immer'
import { observer } from 'mobx-react-lite'
import { MentionsOptionProps } from 'antd/es/mentions'
import { getUserIds } from '../../utils/mentionPattern'
import { VoiceRecorderState, voiceMessageStore } from '../../stores/voiceMessageStore'

import AudioAnalyser from '../AudioAnalyser'
import ReactDOM from 'react-dom'
import { authStore } from '../../stores/authStore'
import { click } from '@testing-library/user-event/dist/click'

//针对输入框数值的一些常数
const lineHeight = 15,
    borderTop = 1,
    borderBottom = 1

export const MessageSelectedFooter = () => {
    return (
        <div className="chat-footer border-top py-xl-4 py-lg-2 py-2">
            <div className="container-xxl">
                <div className="row">
                    <div className="col-12">
                        <div className="input-group align-items-center"></div>
                        <div className="input-group-append">
                            <span className="input-group-text border-0 pr-0">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    onClick={action(() => {
                                        modalStore.modalType = 'TransferChat'
                                        modalStore.isOpen = true
                                    })}>
                                    <span className="d-none d-md-inline-block me-2">合并转发</span>
                                    <i className="zmdi zmdi-mail-send"></i>
                                </button>
                                <span className="input-group-text border-0 pr-0">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={() => messageSelectStore.reset()}>
                                        <span className="d-none d-md-inline-block me-2">
                                            取消多选
                                        </span>
                                    </button>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const VoiceMessageFooter = observer(
    ({ sendVoiceMessageHandler }: { sendVoiceMessageHandler: (file: File) => void }) => {
        const recorderRef: React.LegacyRef<AudioAnalyser> | null = useRef(null)

        const audioProps = {
            ref: recorderRef,
            audioType: 'audio/wav',
            // audioOptions: { sampleRate: 16000 },
            backgroundColor: 'rgba(255, 255, 255, 1)',
            strokeColor: '#000000',
            height: 30,
            width: window.innerWidth / 2 - 100,
        }

        return (
            <div className="chat-footer border-top py-xl-4 py-lg-2 py-2">
                <div className="container-xxl">
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group align-items-center"></div>

                            <div className="input-group-append">
                                <span className="input-group-text border-0">
                                    <button
                                        className="btn btn-sm btn-link text-muted"
                                        data-toggle="tooltip"
                                        title="发送语音"
                                        type="button"
                                        onClick={action(() => {
                                            voiceMessageStore.showVoiceFooter = false
                                            recorderRef.current?.stopAudio()
                                        })}>
                                        <i className="zmdi zmdi-comment-text font-22"></i>
                                    </button>
                                    <div style={{ width: '15px' }}></div>
                                    <AudioAnalyser {...audioProps} />

                                    <div style={{ width: '25px' }}></div>
                                    {voiceMessageStore.state === VoiceRecorderState.Recording ? (
                                        <>
                                            <button
                                                className="btn btn-primary"
                                                onClick={action(() => {
                                                    voiceMessageStore.state =
                                                        VoiceRecorderState.Sending
                                                    if (recorderRef.current) {
                                                        recorderRef.current.blobReceiver = (
                                                            blob
                                                        ) => {
                                                            const file = new File(
                                                                [blob],
                                                                'voice-' +
                                                                    authStore.userId +
                                                                    '-' +
                                                                    Date.now().toString() +
                                                                    '.wav',
                                                                { type: 'audio/wav' }
                                                            )
                                                            sendVoiceMessageHandler(file)
                                                            if (recorderRef.current) {
                                                                recorderRef.current.blobReceiver = (
                                                                    e
                                                                ) => {}
                                                            }
                                                        }

                                                        recorderRef.current.stopAudio()
                                                    }
                                                })}>
                                                结束并发送录音
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={action(() => {
                                                voiceMessageStore.state =
                                                    VoiceRecorderState.Recording
                                                recorderRef.current?.startAudio()
                                            })}>
                                            开始录音
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)

const EmojiSelectorTitle = (title: string) => <span>{title}</span>

const start = 0x01f600
const end = 0x01f61a

const EmojiContent = ({text, setText, handleClick} : {text: string, setText: any, handleClick: any}) => {
    const [emojis, setEmojis] = useImmer<string[]>([])

    useEffect(() => {
        setEmojis([])
        for (let i = start; i < end; i++) {
            setEmojis((draft) => {
                draft.push(String.fromCodePoint(i))
            })
        }
    }, [])
    // TODO: yjx 调整选择表情的样式
    return (
        <div style={{display: 'inline-flex'}}>
            {emojis.map((emoji) => (
                <div key={emoji} onClick={() => {
                    setText(text + emoji)
                    handleClick()
                }}>
                    <button>{emoji}</button>
                </div>
            ))}
        </div>
    )
}

export const ChatViewFooter = observer(
    (props: { handleSendText: Function; chat: Chat; handleSendMention: Function }) => {
        // 消息发送在父组件处理
        // 接受ChatId
        const [text, setText] = useImmer<string>('')
        const [showEmoji, setShowEmoji] = useImmer<boolean>(false)

        const inputRef: any = useRef<HTMLTextAreaElement>(null)
        console.log('111')
        const handleSend = () => {
            const userIds = getUserIds(text)
            if (userIds.length === 0) {
                props.handleSendText(text)
                setText('')
            } else {
                props.handleSendMention(userIds, text)
                setText('')
            }
        }

        const onChange = (value: string) => {
            setText(value)
        }

        const onKeyDown = (e: any) => {
            if (e.key === 'Enter' && !checktext()) {
                handleSend()
            }
        }
        const checktext = () => {
            const reg = /^\s*$/g
            if (reg.test(text) || text.length > 500) return true
            return false
        }

        useEffect(() => {
            window.addEventListener('keydown', onKeyDown)
            return () => {
                window.removeEventListener('keydown', onKeyDown)
            }
        })


        return (
            <div className="chat-footer border-top py-xl-4 py-lg-2 py-2">
                <div className="container-xxl">
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group align-items-center">
                                <div className="input-group-append d-none d-sm-block">
                                    <span className="input-group-text border-0">
                                        <button
                                            className="btn btn-sm btn-link text-muted"
                                            data-toggle="tooltip"
                                            title="发送语音"
                                            type="button"
                                            onClick={action(() => {
                                                voiceMessageStore.showVoiceFooter = true
                                            })}>
                                            <i className="zmdi zmdi-mic font-22"></i>
                                        </button>
                                    </span>
                                </div>

                                <Mentions
                                    className="form-control border-0 pl-0 text-footerform"
                                    ref={inputRef}
                                    value={text}
                                    id="textinputer"
                                    autoSize
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                        }
                                    }}
                                    onChange={onChange}
                                    defaultValue=""
                                    options={props.chat.mentionUserList}
                                />


                                <div className="input-group-append">
                                    <span className="input-group-text border-0">
                                        <Popover
                                            trigger="click"
                                            title={EmojiSelectorTitle('表情')}
                                            content={<EmojiContent text={text} setText={setText} handleClick={() => setShowEmoji(false)}/>}
                                            open={showEmoji}
                                            onOpenChange={(open) => setShowEmoji(open)}>
                                            <button
                                                className="btn btn-sm btn-link text-muted"
                                                data-toggle="tooltip"
                                                title="表情"
                                                type="button">
                                                <i className="zmdi zmdi-mood font-22"></i>
                                            </button>
                                        </Popover>
                                    </span>
                                </div>
                                <div className="input-group-append">
                                    <span className="input-group-text border-0">
                                        <button
                                            className="btn btn-sm btn-link text-muted"
                                            data-toggle="tooltip"
                                            title="附件"
                                            type="button">
                                            <i className="zmdi zmdi-file font-22"></i>
                                        </button>
                                    </span>
                                </div>

                                <div className="input-group-append">
                                    <span className="input-group-text border-0 pr-0">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            onKeyDown={onKeyDown}
                                            onClick={handleSend}
                                            //不能发空格串，最大长度500字
                                            disabled={checktext() ? true : false}>
                                            <span className="d-none d-md-inline-block me-2">
                                                发送
                                            </span>
                                            <i className="zmdi zmdi-mail-send"></i>
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
