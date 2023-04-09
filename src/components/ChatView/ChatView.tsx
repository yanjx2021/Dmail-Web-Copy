import { observer } from "mobx-react-lite"
import { Chat, ChatMessage, chatStore } from "../../stores/chatStore"
import { ChatViewHeader } from "./ChatViewHeader"
import { ChatMessageContent } from "./ChatViewContent"
import { useState, useCallback } from "react"
import { ChatViewFooter } from "./ChatViewFooter"
import { authStore } from "../../stores/authStore"
import { useImmer } from "use-immer"

export const ChatView = 
    ({chat}: { chat: Chat}) => {
        const [messages, setMessages] = useImmer<ChatMessage[]>([])
        
        const sendMessageHanlder = useCallback(
            (text : string) => {
                const msg = chat.sendMessage(text)
                setMessages([...messages, msg])
            }
        , [chat, messages, setMessages])

        return (
            <div className="main px-xl-5 px-lg-4 px-3">
                <div className="chat-body">
                    <ChatViewHeader chat={chat}  />
                    <ChatMessageContent chat={chat} messages={messages} setMessages={setMessages}/>
                    {/* <ChatViewFooter handleSend={sendMessageHanlder}/> */}
                </div>
            </div>
        )
    }

