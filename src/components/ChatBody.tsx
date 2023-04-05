import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import MessageContent from './MessageContent'
import MessageFooter from './MessageFooter'
import MessageHeader from './MessageHeader'
import { messageServer } from '../utils/networkWs'
import { Send } from '../utils/message'

const ChatBody = (props: { chat: Chat; updateChat: Function }) => {
    const [chat, setChat] = useState<Chat>(props.chat)
    useEffect(() => {
        setChat(props.chat)
    }, [props.chat])
    return (
        <div className="main px-xl-5 px-lg-4 px-3">
            <div className="chat-body">
                <MessageHeader chatId={chat.chatId} chatName={chat.chatName} />
                <MessageContent messages={chat.messages} />
                <MessageFooter
                    handleSend={(text: string, timestamp: number) => {
                        messageServer.getInstance().send<Send.SendMessage>(Send.SendMessage, {
                            chatId: chat ? chat.chatId : 0,
                            text: text,
                            timestamp: timestamp,
                            clientId: 0,
                        })
                        props.updateChat(chat.chatId, text, timestamp)
                    }}
                />
            </div>
        </div>
    )
}

export default ChatBody
