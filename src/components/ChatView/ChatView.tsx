import { observer } from 'mobx-react-lite'
import { Chat, ChatMessage, chatStore } from '../../stores/chatStore'
import { ChatViewHeader } from './ChatViewHeader'
import { ChatMessageContent } from './ChatViewContent'
import { useState, useCallback, useEffect } from 'react'
import { ChatViewFooter } from './ChatViewFooter'
import { authStore } from '../../stores/authStore'
import { useImmer } from 'use-immer'
import { action, runInAction } from 'mobx'
import { ChatSidebar } from '../ChatProfile/ChatSidebar'
import { UserSidebar } from './UserSidebar'
import { chatSideStore } from '../../stores/chatSideStore'
import { secureAuthStore } from '../../stores/secureAuthStore'

export const ChatView = 
    ({chat}: { chat: Chat}) => {
        const [messages, setMessages] = useImmer<ChatMessage[]>([])
        
        const sendMessageHanlder = useCallback(
            (text : string) => {
                const msg = chat.sendTextMessage(text)
                setMessages([...messages, msg])
            }
        }),
        [chat, secureAuthStore.showSecureBox]
    )

    useEffect(
        action(() => {
            if (!secureAuthStore.showSecureBox) {
                chat.setReadCuser()
            }
        }),
        [chat, secureAuthStore.showSecureBox]
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
        action(() => {
            setMessages(chat.getMessages(chat.lastMessage!.inChatId!, 20))
            chatStore.setViewMessages = setMessages
            chatStore.activeChatId = chat.chatId
        }),
        [chat, setMessages]
    )

    return (
        <div className={'main px-xl-5 px-lg-4 px-3 ' + chatSideStore.sidebarState}>
            <div className="chat-body">
                <ChatViewHeader chat={chat} />
                <ChatMessageContent chat={chat} messages={messages} setMessages={setMessages} />
                <ChatViewFooter handleSend={sendMessageHanlder} />
            </div>
            <ChatSidebar chat={chat} />
            <UserSidebar chat={chat} />
        </div>
    )
})
