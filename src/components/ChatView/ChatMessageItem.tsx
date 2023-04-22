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

const MessageAlert = () => {
    return (
        <div>
            <a className="text-muted ms-1 p-2 text-muted" href="#">
                <i className="zmdi zmdi-alert-circle"></i>
            </a>
        </div>
    )
}
const MessageTool = () => {
    return (
        <div className="dropdown">
            <a
                className="text-muted me-1 p-2 text-muted"
                href="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                <i className="zmdi zmdi-more-vert"></i>
            </a>
            <div className="dropdown-menu">
                <a className="dropdown-item" href="#">
                    编辑
                </a>
                <a className="dropdown-item" href="#">
                    分享
                </a>
                <a className="dropdown-item" href="#">
                    删除
                </a>
            </div>
        </div>
    )
}

export const ChatMessageItemContent = observer(({ msg }: { msg: ChatMessage }) => {
    const isRight = msg.senderId === authStore.userId

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
    } else if (msg.type === ChatMessageType.Revoked) {
        return (
            <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                {"消息已撤回"}
            </div>
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
            const isRight = msg.senderId === authStore.userId
            return msg.type === ChatMessageType.Deleted ? (
                <div style={{ height: '1px' }}></div>
            ) : (
                <li className={'d-flex message' + (isRight ? ' right' : '')} ref={ref}>
                    {!isRight ? (
                        <div className="avatar mr-lg-3 me-2">
                            <div
                                //添加颜色
                                className={'avatar rounded-circle no-image ' + ''}>
                                <span>{msg.senderId}</span>
                            </div>
                        </div>
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
                                    {enableDropDown && messageSelectStore.showSelector && (
                                        <MessageSelector msg={msg} />
                                    )}
                                </>
                            ) : (
                                <>
                                    {enableDropDown && messageSelectStore.showSelector && (
                                        <MessageSelector msg={msg} />
                                    )}
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
