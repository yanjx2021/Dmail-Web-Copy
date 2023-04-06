import { useEffect, useRef, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import MessageItem from './MessageItem'

const MessageContent = (props: { messages: Message[] }) => {
    const messagesEnd = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (messagesEnd && messagesEnd.current) {
            messagesEnd.current.scrollIntoView()
        }
    }
    useEffect(() => {
        scrollToBottom()
    })

    return (
        <>
            <div className="chat-content">
                <div className="container-xxl">
                    <ul className="list-unstyled py-4">
                        {[...props.messages].map((message) => (
                            <MessageItem {...message} key={message.inChatId} />
                        ))}
                        <div
                            style={{ clear: 'both', height: '1px', width: '100%' }}
                            ref={messagesEnd}></div>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default MessageContent
