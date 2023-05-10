/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import {
    Chat,
    ChatMessage,
    ChatMessageFileInfo,
    ChatMessageTransferInfo,
    ChatMessageType,
    MentionTextContent,
} from '../../stores/chatStore'
import { authStore } from '../../stores/authStore'
import '../../styles/ChatMessageItem.css'
import { userStore } from '../../stores/userStore'
import { fileStore } from '../../stores/fileStore'
import { blobToBase64, createDownload } from '../../utils/file'
import { action, makeAutoObservable } from 'mobx'
import { binaryStore } from '../../stores/binaryStore'
import { MessageDropDown } from '../DropDown/MessageDropDown'
import { MessageSelector, messageSelectStore } from '../MessagesBox/Selector'
import { modalStore } from '../../stores/modalStore'
import { chatSideStore } from '../../stores/chatSideStore'
import { FileItem, LoadingFileItem } from './FileItem'
import { LoadingPhotoItem, PhotoItem } from './PhotoItem'
import { Image } from 'antd'
import { renderFormatUrl } from '../../utils/urlToLink'

export const ChatMessageItemContent = observer(({ msg }: { msg: ChatMessage }) => {
    const isRight = msg.senderId === authStore.userId

    if (msg.type === ChatMessageType.Text && typeof msg.content === 'string') {
        return (
            <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                {renderFormatUrl(msg.content)}
                {msg.translatedText && (
                    <div>
                        <p>------翻译结果------</p>
                        <p>{msg.translatedText}</p>
                    </div>
                )}
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
                <div className='audio-div'>
                    <audio src={cachedUrl.url} controls />
                    {msg.translatedText && (
                        <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                            <p>------转换结果------</p>
                            <p>{msg.translatedText}</p>
                        </div>
                    )}
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
            <div className={'message-content p-3 text-record' + (isRight ? ' border' : '')}>
                <div
                    onClick={action(() => {
                        modalStore.transferInfo = msg.content as ChatMessageTransferInfo
                        modalStore.modalType = 'TransferChatBox'
                        modalStore.isOpen = true
                    })}>
                    {/* TODO: 标题私聊时变成**与我的聊天记录，群聊时变为群聊的聊天记录 */}
                    <h5>{'[a和b的聊天记录]'}</h5>
                    {/* TODO:获取最多三条聊天记录即可（超过的会看不见），不行的话就一条 */}
                    <div className='text-record-container'>
                    <p>a:1zzzzzz23123</p>
                    <p>c:12312zzzzzzzzzzzzzzzzz3</p>
                    <p>c:123123zzzzzzzzzzzzzzzzz</p>
                    </div>
                    <div className='record-counter'>查看n条转发消息</div>
                </div>
            </div>
        )
    } else if (msg.type === ChatMessageType.Revoked) {
        return (
            <div className={'message-content p-3' + (isRight ? ' border' : '')}>{'消息已撤回'}</div>
        )
    }
    return <div></div>
})

export const ChatMessageItem = observer(
    React.forwardRef(
        (
            {
                msg,
                indexInView,
                enableDropDown,
            }: { msg: ChatMessage; indexInView: number; enableDropDown: boolean },
            ref: any
        ) => {
            const user = userStore.getUser(msg.senderId)
            const isRight = msg.senderId === authStore.userId
            return msg.type === ChatMessageType.Deleted ? (
                <div style={{ height: '1px' }}></div>
            ) : (
                <li className={'d-flex message' + (isRight ? ' right' : '')} ref={ref}>
                    {enableDropDown && messageSelectStore.showSelector && (
                        <MessageSelector msg={msg} />
                    )}
                    {!isRight ? (
                        <a
                            type="button"
                            onClick={action(() => chatSideStore.visitUsertoggle(user))}>
                            <div className="avatar mr-lg-3 me-2">
                                <img
                                    className={'avatar rounded-circle no-image ' + ''}
                                    src={
                                        !user.avaterHash || user.avaterHash === ''
                                            ? 'assets/images/user.png'
                                            : binaryStore.getBinaryUrl(user.avaterHash).url
                                    }
                                    alt="avatar"
                                />
                            </div>
                        </a>
                    ) : (
                        ''
                    )}
                    <div className="message-body">
                        <span className="date-time text-muted">{msg.getMessageTip}</span>
                        <div
                            className={
                                'message-row d-flex align-items-center' +
                                (isRight ? ' justify-content-end' : '')
                            }>
                            {isRight ? (
                                <>
                                    {enableDropDown && (
                                        <MessageDropDown msg={msg} indexInView={indexInView} />
                                    )}
                                    <ChatMessageItemContent msg={msg} />
                                </>
                            ) : (
                                <>
                                    <ChatMessageItemContent msg={msg} />
                                    {enableDropDown && (
                                        <MessageDropDown msg={msg} indexInView={indexInView} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </li>
            )
        }
    )
)
