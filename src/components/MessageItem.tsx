import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import { useImmer } from 'use-immer'

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
const MessageItem = (props: Message) => {
    return (
        <li className={'d-flex message' + (props.isRight ? ' right' : '')}>
            {!props.isRight ? (
                <div className="avatar mr-lg-3 me-2">
                    <div
                        //添加颜色
                        className={'avatar rounded-circle no-image ' + ''}>
                        <span>{props.senderId}</span>
                    </div>
                </div>
            ) : (
                ''
            )}
            <div className="message-body">
                <span className="date-time text-muted">
                    {(props.senderId ? props.senderId + ', ' : '') +
                        new Date(props.timestamp * 1000).toLocaleString()}
                </span>
                <div
                    className={
                        'message-row d-flex align-items-center' +
                        (props.isRight ? ' justify-content-end' : '')
                    }>
                    <div className={'message-content p-3' + (props.isRight ? ' border' : '')}>
                        {props.text}
                    </div>
                </div>
            </div>
        </li>
    )
}

export default MessageItem
