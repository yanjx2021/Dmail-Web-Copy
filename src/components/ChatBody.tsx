import { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import MessageContent from './MessageContent'
import MessageFooter from './MessageFooter'
import MessageHeader from './MessageHeader'
import { messageServer } from '../utils/networkWs'
import { Send } from '../utils/message'


const ChatBody = (props: {chat: Chat, updateChat: Function}) => {
    const [chat, setChat] = useState<Chat>(props.chat)
    useEffect(() => {
        setChat(props.chat)
    }, [props.chat])
    return (<div className='chat-body'>
        <MessageHeader chatId={chat ? chat.chatId : 0}/>
        <MessageContent messages={chat ? chat.messages : []}/>
        <MessageFooter handleSend={(text: string, timestamp: number) => {
            messageServer.send<Send.SendMessage>(Send.SendMessage, {
                chatId: chat ? chat.chatId : 0,
                text: text,
                timestamp: timestamp,
                clientId: 0
            })
            props.updateChat(chat ? chat.chatId : 0, text, timestamp)
        }}/>
    </div>)
}

export default ChatBody