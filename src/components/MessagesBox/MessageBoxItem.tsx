/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from 'mobx-react-lite'
import React from 'react'
import {
    ChatMessage,
    ChatMessageFileInfo,
    ChatMessageTransferInfo,
    ChatMessageType,
    ReplyTextContent,
    chatStore,
} from '../../stores/chatStore'
import '../../styles/ChatMessageItem.css'
import { action } from 'mobx'
import { binaryStore } from '../../stores/binaryStore'
import { modalStore } from '../../stores/modalStore'
import { FileItem, LoadingFileItem } from '../ChatView/FileItem'
import { LoadingPhotoItem, PhotoItem } from '../ChatView/PhotoItem'
import '../../styles/MessageBoxItem.css'
import { renderFormatUrl } from '../../utils/urlToLink'

export const ChatMessageBoxItemContent = observer(
    ({ msg, userId }: { msg: ChatMessage; userId: number }) => {
        const isRight = msg.senderId === userId

        if (msg.type === ChatMessageType.Text && typeof msg.content === 'string') {
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    {renderFormatUrl(msg.content)}
                </div>
            )
        } else if (msg.type === ChatMessageType.MentionText) {
            const content: any = msg.content
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    {renderFormatUrl(content.text)}
                </div>
            )
        } else if (msg.type === ChatMessageType.Image && typeof msg.content === 'string') {
            if (msg.bindUploading) {
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <LoadingPhotoItem bindUploading={msg.bindUploading} />
                    </div>
                )
            } else {
                const cachedUrl = binaryStore.getBinaryUrl(msg.content)

                return <PhotoItem cachedUrl={cachedUrl} />
            }
        } else if (msg.type === ChatMessageType.Voice && typeof msg.content === 'string') {
            if (msg.bindUploading) {
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <LoadingPhotoItem bindUploading={msg.bindUploading} />
                    </div>
                )
            } else {
                const cachedUrl = binaryStore.getBinaryUrl(msg.content)
                return (
                    <div className="audio-div">
                        <audio src={cachedUrl.url} controls />
                    </div>
                )
            }
        } else if (msg.type === ChatMessageType.File) {
            if (msg.bindUploading) {
                // 正在上传
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <LoadingFileItem bindUploading={msg.bindUploading} />
                    </div>
                )
            } else {
                // 已经收到

                const fileInfo = msg.content as ChatMessageFileInfo
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <FileItem fileInfo={fileInfo} />
                    </div>
                )
            }
        } else if (msg.type === ChatMessageType.Transfer) {
            return (
                <div className={'message-content p-3  ' + (isRight ? ' border' : '')}>
                    <div
                        onClick={action(() => {
                            modalStore.transferInfo = msg.content as ChatMessageTransferInfo
                            modalStore.modalType = 'TransferChatBox'
                            modalStore.isOpen = true
                        })}>
                        <h5>{'[聊天记录]'}</h5>
                    </div>
                </div>
            )
        } else if (msg.type === ChatMessageType.Revoked) {
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    {'消息已撤回'}
                </div>
            )
        } else if (msg.type === ChatMessageType.ReplyText) {
            const content: ReplyTextContent = msg.content as ReplyTextContent
            // const repliedMessage = chatStore.getChat(msg.chatId)
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    回复消息{content.inChatId}:<p>-------------------</p>
                    {renderFormatUrl(content.text)}
                </div>
            )
        }
        return (
            <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                当前版本不支持该消息类型，请升级至最新版本
            </div>
        )
    }
)

export const ChatMessageBoxItem = observer(
    React.forwardRef(({ msg, userId }: { msg: ChatMessage; userId: number }, ref: any) => {
        const isRight = msg.senderId === userId
        return (
            <li className={'d-flex message'} ref={ref}>
                {isRight ? (
                    <div className="avatar mr-lg-3 me-2">
                        <div className={'avatar rounded-circle no-image ' + 'timber'}>
                            <span>我</span>
                        </div>
                    </div>
                ) : (
                    <div className="avatar mr-lg-3 me-2">
                        <div className={'avatar rounded-circle no-image ' + 'timber'}>
                            <span>{msg.senderId}</span>
                        </div>
                    </div>
                )}
                <div className="message-body">
                    <span className="date-time text-muted">{msg.getMessageBoxTip}</span>
                    <div className={'message-row d-flex align-items-center'}>
                        <ChatMessageBoxItemContent msg={msg} userId={userId} />
                    </div>
                </div>
            </li>
        )
    })
)
