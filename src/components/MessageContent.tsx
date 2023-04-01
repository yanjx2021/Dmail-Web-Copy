import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import MessageItem from './MessageItem'

const MessageContent = (props: {messages: Message[]}) => {
    const [messages, setMessages] = useState<Message[]>(props.messages)
    useEffect(() => {
        setMessages(props.messages)
    }, [props.messages])

    return (
        <div className="chat-content">
            <div className="container-xxl">
                <ul className="list-unstyled py-4">
                    {messages.map((message) => (
                        <MessageItem {...message} key={message.inChatId}/>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default MessageContent
