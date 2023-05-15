import { observer } from 'mobx-react-lite'
import {
    Chat,
    ChatMessage,
    ChatMessageFileInfo,
    ChatMessageType,
    ChatType,
    chatStore,
} from '../../stores/chatStore'
import { ChatViewHeader } from './ChatViewHeader'
import { ChatMessageContent } from './ChatViewContent'
import { useState, useCallback, useEffect, LegacyRef } from 'react'
import { ChatViewFooter, MessageSelectedFooter, VoiceMessageFooter } from './ChatViewFooter'
import { useImmer } from 'use-immer'
import { action } from 'mobx'
import { ChatSidebar } from '../ChatProfile/ChatSidebar'
import { UserSidebar } from '../ChatProfile/UserSidebar'
import { chatSideStore } from '../../stores/chatSideStore'
import { secureAuthStore } from '../../stores/secureAuthStore'
import React from 'react'
import { isImage } from '../../utils/file'
import { messageSelectStore, userSelectStore } from '../MessagesBox/Selector'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'
import { VideoCall } from './VideoCall'
import { rtcStore } from '../../stores/rtcStore'
import { AudioCall } from './AudioCall'
import { modalStore } from '../../stores/modalStore'
import { recorderStore } from '../../stores/recorderStore'

export const ChatView = observer(({ chat }: { chat: Chat }) => {
    const [messages, setMessages] = useImmer<ChatMessage[]>([])

    const sendTextMessageHanlder = useCallback(
        (text: string) => {
            const msg = chat.sendTextMessage(text)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    useEffect(
        action(() => {
            if (chat.chatType !== ChatType.Private) {
                MessageServer.Instance().send<Send.GetGroupUsers>(Send.GetGroupUsers, chat.chatId)
            }
        }),
        [chat]
    )

    const sendReplyMessageHandler = useCallback(
        (replyId: number, text: string) => {
            const msg = chat.sendReplyMessage(text, replyId)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    useEffect(() => {
        modalStore.sendReplyMessageHandler = sendReplyMessageHandler
    }, [sendReplyMessageHandler])

    const sendMentionMessageHandler = useCallback(
        (userIds: number[], text: string) => {
            const msg = chat.sendMentionMessage(text, userIds)
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    const sendFileMessageHandler = useCallback(
        (operateFile: File) => {
            const msg = chat.sendFileMessage(ChatMessageType.File, operateFile, (hash, file) => {
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
        (operateFile: File) => {
            const msg = chat.sendFileMessage(ChatMessageType.Image, operateFile, (hash, file) => {
                return hash
            })
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    const sendVoiceMessageHandler = useCallback(
        (operateFile: File) => {
            const msg = chat.sendFileMessage(ChatMessageType.Voice, operateFile, (hash, file) => {
                return hash
            })
            setMessages([...messages, msg])
        },
        [chat, messages, setMessages]
    )

    useEffect(
        action(() => {
            if (!secureAuthStore.showSecureBox) {
                chat.setReadCuser()
                MessageServer.Instance().send<Send.GetChatInfo>(Send.GetChatInfo, chat.chatId)
                chat.atYou = false
            }
        }),
        [chat, secureAuthStore.showSecureBox]
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
        action(() => {
            chat.getMessages(chat.lastMessage!.inChatId!, 20).then(
                action((msgs) => {
                    if (chatStore.activeChatId !== chat.chatId) {
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

    useEffect(
        action(() => {
            messageSelectStore.reset()
            userSelectStore.reset()
        }),
        [chat]
    )

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
        },
        [dragCounter]
    )

    const handleDragOut = useCallback(
        (e: any) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter--
        },
        [dragCounter]
    )

    const handleDrop = useCallback(
        (e: any) => {
            e.preventDefault()
            e.stopPropagation()
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
        let div = dropRef.current!
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
                {!rtcStore.showMediaWindow ? (
                    <ChatMessageContent chat={chat} messages={messages} setMessages={setMessages} />
                ) : (
                    <>
                        {rtcStore.remoteUserId === chat.bindUser?.userId ? (
                            <>{rtcStore.type === 'Video' ? <VideoCall /> : <AudioCall />}</>
                        ) : (
                            <ChatMessageContent
                                chat={chat}
                                messages={messages}
                                setMessages={setMessages}
                            />
                        )}
                    </>
                )}

                {messageSelectStore.showSelector ? (
                    <MessageSelectedFooter />
                ) : recorderStore.showVoiceFooter ? (
                    <VoiceMessageFooter sendVoiceMessageHandler={sendVoiceMessageHandler} />
                ) : (
                    <ChatViewFooter
                        chat={chat}
                        handleSendText={sendTextMessageHanlder}
                        handleSendMention={sendMentionMessageHandler}
                        handleSendFile={sendFileMessageHandler}
                        handleSendImage={sendImageMessageHandler}
                    />
                )}
            </div>
            <ChatSidebar chat={chat} visitUser={chatSideStore.visitUser} />
            <UserSidebar chat={chat} />
        </div>
    )
})
