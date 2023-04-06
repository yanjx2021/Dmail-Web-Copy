import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'

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
    const [message, setMessage] = useState<Message>(props)
    useEffect(() => {
        setMessage(props)
    }, [props])

    return (
        <li className={'d-flex message' + (message.isRight ? ' right' : '')}>
            {!message.isRight ? (
                <div className="avatar mr-lg-3 me-2">
                    <div
                        //添加颜色
                        className={'avatar rounded-circle no-image ' + ''}>
                        <span>{message.senderId}</span>
                    </div>
                </div>
            ) : (
                ''
            )}
            <div className="message-body">
                <span className="date-time text-muted">
                    {(message.senderId ? message.senderId + ', ' : '') +
                        new Date(message.timestamp * 1000).toLocaleString()}
                </span>
                <div
                    className={
                        'message-row d-flex align-items-center' +
                        (message.isRight ? ' justify-content-end' : '')
                    }>
                    <div className={'message-content p-3' + (message.isRight ? ' border' : '')}>
                        {message.text}
                    </div>
                </div>
            </div>
        </li>
    )
}

export default MessageItem