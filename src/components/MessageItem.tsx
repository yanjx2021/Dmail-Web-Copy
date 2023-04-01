import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'


const MessageItem = (props: Message) => {
    const [message, setMessage] = useState<Message>(props)
    useEffect(() => {
        setMessage(props)
    }, [props])

    return (
        <li className={"d-flex message" + (message.isRight ? " right" : "")}>
            {!message.isRight ? (<div className="mr-lg-3 me-2">
                <div className="avatar rounded-circle no-image timber">
                    <span>{message.senderId}</span>
                </div>
            </div>) : ''}
            <div className="message-body">
                <span className="date-time text-muted">{(message.senderId ? (message.senderId + ', ') : '') +  new Date(message.timestamp)}</span>
                <div
                    className={
                        'message-row d-flex align-items-center' + (message.isRight
                            ? ' justify-content-end'
                            : '')
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