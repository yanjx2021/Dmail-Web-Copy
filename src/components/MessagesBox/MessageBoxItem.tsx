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
import { imageStore } from '../../stores/imageStore'
import { MessageDropDown } from '../DropDown/MessageDropDown'
import { MessageSelector, messageSelectStore } from '../MessagesBox/Selector'
import { modalStore } from '../../stores/modalStore'

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
                        <h3>图片正在上传</h3>
                        <h5>{msg.bindUploading.progress}</h5>
                    </div>
                )
            } else {
                const cachedUrl = imageStore.getImageUrl(msg.content)

                return <img className="rounded mt-1" src={cachedUrl.url} alt=""></img>
            }
        } else if (msg.type === ChatMessageType.File) {
            if (msg.bindUploading) {
                // 正在上传
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <h3>文件正在上传</h3>
                        <h5>{msg.bindUploading.progress}</h5>
                    </div>
                )
            } else {
                // 已经收到

                const fileInfo = msg.content as ChatMessageFileInfo
                return (
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        <h3>文件</h3>
                        <h5>{fileInfo.name}</h5>
                        <h5>{fileInfo.hash}</h5>
                        <h5>{fileInfo.size}</h5>
                        <button
                            onClick={action(() =>
                                fileStore.getFileUrl(fileInfo.hash, (url) =>
                                    createDownload(url, fileInfo.name)
                                )
                            )}></button>
                    </div>
                )
            }
        } else if (msg.type === ChatMessageType.Transfer) {
            return (
                <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                    <a
                        type="button"
                        onClick={action(() => {
                            modalStore.transferInfo = msg.content as ChatMessageTransferInfo
                            modalStore.modalType = 'TransferChatBox'
                            modalStore.isOpen = true
                        })}>
                        {'[聊天记录]'}
                    </a>
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
            <li className={'d-flex message' + (isRight ? ' right' : '')} ref={ref}>
                {isRight ? (
                    <></>
                ) : (
                    <div className="avatar mr-lg-3 me-2">
                        <div className={'avatar rounded-circle no-image ' + ''}>
                            <span>{msg.senderId}</span>
                        </div>
                    </div>
                )}
                <div className="message-body">
                    <span className="date-time text-muted">{msg.getMessageBoxTip}</span>
                    <div
                        className={
                            'message-row d-flex align-items-center' +
                            (isRight ? ' justify-content-end' : '')
                        }>
                        <ChatMessageBoxItemContent msg={msg} userId={userId} />
                    </div>
                </div>
                {isRight ? (
                    <div className="avatar mr-lg-3 me-2">
                        <div className={'avatar rounded-circle no-image ' + ''}>
                            <span>{userId}</span>
                        </div>
                    </div>
                ) : (
                    <></>
                )}
            </li>
        )
    })
)
