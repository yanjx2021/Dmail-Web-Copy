import { observer } from 'mobx-react-lite'
import { Chat, ChatMessage, chatStore } from '../../stores/chatStore'
import { ChatViewHeader } from './ChatViewHeader'
import { ChatMessageContent } from './ChatViewContent'
import { useState, useCallback, useEffect } from 'react'
import { ChatViewFooter } from './ChatViewFooter'
import { authStore } from '../../stores/authStore'
import { useImmer } from 'use-immer'
import { action, runInAction } from 'mobx'
import { ChatSidebar } from './ChatSidebar'
import { UserSidebar } from './UserSidebar'

export const ChatView = ({ chat }: { chat: Chat }) => {
    const [messages, setMessages] = useImmer<ChatMessage[]>([])
    const [chatSide, setChatSide] = useImmer<boolean>(false)
    const [userSide, setUserSide] = useImmer<boolean>(false)

    const sendMessageHanlder = useCallback(
        (text: string) => {
            const msg = chat.sendMessage(text)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )
    const sideBarHanlder = (text: string) => {
        if (text === 'openchatsidebar') setChatSide(!chatSide)
        if (text === 'openusersidebar') setUserSide(!userSide)
        if (text === 'closechatsidebar') setChatSide(false)
        if (text === 'closeusersidebar') setUserSide(false)
    }

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
        <div
            className={
                'main px-xl-5 px-lg-4 px-3 ' +
                (chatSide ? 'open-chat-sidebar ' : '') +
                (userSide ? 'open-user-sidebar ' : '')
            }>
            <div className="chat-body">
                <ChatViewHeader chat={chat} sideHandler={sideBarHanlder}/>
                <ChatMessageContent chat={chat} messages={messages} setMessages={setMessages} />
                <ChatViewFooter handleSend={sendMessageHanlder} />
            </div>
            <ChatSidebar chat={chat} sideHandler={sideBarHanlder} />
            <UserSidebar chat={chat} sideHandler={sideBarHanlder} />
        </div>
    )
}
