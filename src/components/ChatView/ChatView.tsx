import { observer } from 'mobx-react-lite'
import {
    Chat,
    ChatMessage,
    ChatMessageFileInfo,
    ChatMessageType,
    chatStore,
} from '../../stores/chatStore'
import { ChatViewHeader } from './ChatViewHeader'
import { ChatMessageContent } from './ChatViewContent'
import { useState, useCallback, useEffect, LegacyRef } from 'react'
import { ChatViewFooter } from './ChatViewFooter'
import { authStore } from '../../stores/authStore'
import { useImmer } from 'use-immer'
import { action, runInAction } from 'mobx'
import { ChatSidebar } from '../ChatProfile/ChatSidebar'
import { UserSidebar } from './UserSidebar'
import { chatSideStore } from '../../stores/chatSideStore'
import { secureAuthStore } from '../../stores/secureAuthStore'
import React from 'react'
import { UploadingFile, fileStore } from '../../stores/fileStore'
import { isImage } from '../../utils/file'

export const ChatView = observer(({ chat }: { chat: Chat }) => {
    const [messages, setMessages] = useImmer<ChatMessage[]>([])

    const sendTextMessageHanlder = useCallback(
        (text: string) => {
            const msg = chat.sendTextMessage(text)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    const sendFileMessageHandler = useCallback(
        (file: File) => {
            const msg = chat.sendFileMessage(ChatMessageType.File, file, (hash, file) => {
                const content: ChatMessageFileInfo = {
                    name: file.name,
                    hash: hash,
                    size: file.size,
                }
                return content
            })
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    const sendImageMessageHandler = useCallback(
        (file: File) => {
            const msg = chat.sendFileMessage(ChatMessageType.Image, file, (hash, file) => {
                return hash
            })
            console.log(msg)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
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
            chat.getMessages(chat.lastMessage!.inChatId!, 20).then(
                action((msgs) => {
                    if (chatStore.activeChatId !== chat.chatId!) {
                        return
                    }
                    setMessages(msgs)
                })
            )

            chatStore.setViewMessages = setMessages
            chatStore.activeChatId = chat.chatId
        }),
        [chat, setMessages]
    )

    const [drag, setDrag] = useState(false)
    const [filename, setFilename] = useState('')

    // 创建组件引用
    const dropRef: LegacyRef<HTMLDivElement> | undefined = React.createRef()
    let dragCounter = 0

    const handleDrag = useCallback((e: any) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = useCallback(
        (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter++
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setDrag(true)
        },
        [dragCounter]
    )

    const handleDragOut = useCallback(
        (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter--
            if (dragCounter === 0) setDrag(false)
        },
        [dragCounter]
    )

    const handleDrop = useCallback(
        (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            setDrag(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length === 1) {
                const file = e.dataTransfer.files[0]
                if (isImage(file)) {
                    sendImageMessageHandler(file)
                } else {
                    sendFileMessageHandler(file)
                }

                e.dataTransfer.clearData()
                dragCounter = 0
            }
        },
        [sendFileMessageHandler]
    )

    React.useEffect(() => {
        let div = dropRef!.current!
        div.addEventListener('dragenter', handleDragIn)
        div.addEventListener('dragleave', handleDragOut)
        div.addEventListener('dragover', handleDrag)
        div.addEventListener('drop', handleDrop)

        return function cleanup() {
            div.removeEventListener('dragenter', handleDragIn)
            div.removeEventListener('dragleave', handleDragOut)
            div.removeEventListener('dragover', handleDrag)
            div.removeEventListener('drop', handleDrop)
        }
    }, [dropRef, handleDrag, handleDragIn, handleDragOut, handleDrop])

    return (
        <div className={'main px-xl-5 px-lg-4 px-3 ' + chatSideStore.sidebarState}>
            <div className="chat-body" ref={dropRef}>
                <ChatViewHeader chat={chat} />
                <ChatMessageContent chat={chat} messages={messages} setMessages={setMessages} />
                <ChatViewFooter handleSend={sendTextMessageHanlder} />
            </div>
            <ChatSidebar chat={chat} />
            <UserSidebar chat={chat} />
        </div>
    )
})
