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
} from '../../stores/chatStore'
import { authStore } from '../../stores/authStore'
import '../../styles/ChatMessageItem.css'
import { userStore } from '../../stores/userStore'
import { fileStore } from '../../stores/fileStore'
import { createDownload } from '../../utils/file'
import { action, makeAutoObservable } from 'mobx'
import { binaryStore } from '../../stores/binaryStore'
import { MessageDropDown } from '../DropDown/MessageDropDown'
import { MessageSelector, messageSelectStore } from '../MessagesBox/Selector'
import { modalStore } from '../../stores/modalStore'
import { FileItem, LoadingFileItem } from '../ChatView/FileItem'
import { LoadingPhotoItem, PhotoItem } from '../ChatView/PhotoItem'
import '../../styles/MessageBoxItem.css'

export const ChatMessageBoxItemContent = observer(
    ({ msg, userId }: { msg: ChatMessage; userId: number }) => {
        const isRight = msg.senderId === userId

        if (msg.type === ChatMessageType.Text && typeof msg.content === 'string') {
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    {msg.content as string}
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
                <div className={'message-content p-3 ' + (isRight ? ' border' : '')}>
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
        }
        return <div></div>
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
