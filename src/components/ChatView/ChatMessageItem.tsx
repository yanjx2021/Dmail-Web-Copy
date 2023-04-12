/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import { ChatMessage } from '../../stores/chatStore'
import { authStore } from '../../stores/authStore'
import "../../styles/ChatMessageItem.css"
import { userStore } from '../../stores/userStore'

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
export const ChatMessageItem = observer(React.forwardRef(({msg}: { msg: ChatMessage}, ref : any) => {
    const isRight = msg.senderId === authStore.userId
    return (
        <li className={'d-flex message' + (isRight ? ' right' : '')} ref={ref}>
            {!isRight ? (
                <div className="avatar mr-lg-3 me-2">
                    <div
                        //添加颜色
                        className={'avatar rounded-circle no-image ' + ''}>
                        <span>{msg.senderId}</span>
                    </div>
                </div>
            ) : ( '' )}
            <div className="message-body">
                <span className="date-time text-muted">
                    {msg.getMessageTip}
                </span>
                <div
                    className={
                        'message-row d-flex align-items-center' +
                        (isRight ? ' justify-content-end' : '')
                    }>
                    <div className={'message-content p-3' + (isRight ? ' border' : '')}>
                        {msg.text}
                    </div>
                </div>
            </div>
        </li>
    )
}
))