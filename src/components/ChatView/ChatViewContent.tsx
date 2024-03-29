import { useEffect, useRef, useState, useCallback } from 'react'
import { Chat, ChatMessage, ChatType, chatStore } from '../../stores/chatStore'
import { ChatMessageItem } from './ChatMessageItem'
import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Virtuoso } from 'react-virtuoso'
import { authStore } from '../../stores/authStore'
import { message } from 'antd'

export const ChatMessageContent = observer(
    ({
        chat,
        messages,
        setMessages,
    }: {
        chat: Chat
        messages: ChatMessage[]
        setMessages: any
    }) => {
        const virtuosoRef: any = useRef(null)

        const [atBottom, setAtBottom] = useState(false)
        const showButtonTimeoutRef: any = useRef(null)
        const [showButton, setShowButton] = useState(false)

        const prependItems = useCallback(() => {
            const firstIndex = action(() => messages[0].inChatId!)()

            if (firstIndex === 1) {
                return
            }
            const messagesToPrepend: number = 20

            chat.getMessages(firstIndex - 1, messagesToPrepend).then(
                action((msgs) => {
                    if (chatStore.activeChatId !== chat.chatId) {
                        return
                    }
                    setMessages(() => [...msgs, ...messages])
                })
            )
        }, [chat, messages, setMessages])

        const scrollIndex = useCallback(
            action((inChatId: number, anotherId: number) => {
                if (messages && messages[0] && messages[0].inChatId! <= inChatId) {
                    // 找到了
                    
                    message.destroy('prependLoading')
                    console.log('找到啦', messages[inChatId - messages[0].inChatId!])
                    if (messages[0] && messages[0].inChatId) {
                        virtuosoRef.current.scrollToIndex({
                            index: inChatId - messages[0].inChatId,
                            behavior: 'auto',
                        })
                    }
                } else {
                    const firstIndex = action(() => messages[0].inChatId!)()
                    if (firstIndex === 1) {
                        return
                    }
                    message.loading({
                        key: 'prependLoading',
                        content: '正在拉取历史消息...',
                    }).then(() => {
                        message.success('历史消息拉取成功')
                    })
                    chat.getMessages(firstIndex - 1, 80).then(
                        action((msgs) => {
                            if (chatStore.activeChatId !== chat.chatId) {
                                return
                            }
                            setMessages(() => [...msgs, ...messages])
                            console.log(`reply${chat.chatId}+${anotherId}`)
                            setTimeout(() => {
                                document.getElementById(`reply${chat.chatId}+${anotherId}`)?.click()
                            }, 50);
                        })
                    )
                }
            }),
            [chat, messages, setMessages, virtuosoRef]
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const itemContent = useCallback(
            action((index: number, message: ChatMessage) => (
                <ChatMessageItem
                    scroll={scrollIndex}
                    msg={message}
                    indexInView={index - 1}
                    key={
                        message.senderId === authStore.userId ? message.timestamp : message.inChatId
                    }
                    enableDropDown={true}
                />
            )),
            [scrollIndex]
        )

        useEffect(() => {
            if (!atBottom) {
                showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500)
            } else {
                setShowButton(false)
            }
        }, [atBottom])

        useEffect(
            action(() => {
                if (chat && chat.chatType === ChatType.Private) {
                    chat.pullOppositeReadCursor()
                }
            }),
            [chat]
        )

        return (
            <>
                <div className="chat-content">
                    <Virtuoso
                        className=" container-xxl list-unstyled py-4"
                        ref={virtuosoRef}
                        firstItemIndex={messages[0]?.inChatId ?? 1}
                        initialTopMostItemIndex={chat.lastMessage!.inChatId}
                        data={messages}
                        startReached={prependItems}
                        itemContent={itemContent}
                        atBottomStateChange={setAtBottom}
                        followOutput={'auto'}
                    />
                    {showButton && (
                        <button
                            onClick={() =>
                                virtuosoRef.current.scrollToIndex({
                                    index: messages.length - 1,
                                    behavior: 'smooth',
                                })
                            }
                            style={{
                                float: 'right',
                                transform: 'translate(60rem, -1rem)',
                                width: '3',
                            }}>
                            Bottom
                        </button>
                    )}
                </div>
            </>
        )
    }
)

// export const ChatMessageContent = observer(
//     ({chat}: { chat: Chat}) => {
//         const blockSize = 20
//         const bufferSize = 3 * blockSize
//         const cacheSize = bufferSize - blockSize

//         const [curMsgs, setCurMsgs] = useState<ChatMessage[]>([])

//         useEffect(() => {
//             runInAction(() => setCurMsgs(chat.getMessages(chat.lastMessage!.inChatId, bufferSize)) )
//         }, [chat, bufferSize])

//         const overlayRef : any = useRef<any>(null)

//         const tombRef : any = useRef<any>(null)

//         const [currentScrollTopPosition, setCurrentScrollTopPosition] = useState(0)

//         const prevCallback = action(() => {
//             const newMsgs = [...chat.getMessages(curMsgs[0].inChatId - 1, blockSize), ...curMsgs.slice(0, cacheSize)]
//             setCurMsgs(newMsgs)
//         })

//         const nextCallback = action(() => {
//             const newMsgs = [...curMsgs.slice(-cacheSize), ...chat.getMessages(curMsgs[curMsgs.length - 1].inChatId + blockSize, blockSize), ]
//             setCurMsgs(newMsgs)
//         })

//         const scrollHandler = action((target : any) => {
//             const scrollTop = Math.round(target.scrollTop)
//             const clientHeight = Math.round(target.clientHeight)
//             const scrollHeight = Math.round(target.scrollHeight)
//             const perItemHeight = 40

//             const isUp = scrollTop < currentScrollTopPosition
//             console.log(perItemHeight)

//             if (isUp && scrollTop === 0) {
//                 prevCallback()

//                 if (overlayRef !== null) {
//                     const scrollPos = perItemHeight * blockSize
//                     overlayRef.current.scrollTo(0, scrollPos)
//                 }

//             } else if (!isUp && scrollTop + clientHeight >= scrollHeight) {
//                 nextCallback()

//                 if (overlayRef !== null) {
//                     const scrollPos = perItemHeight * blockSize
//                     overlayRef.current.scrollTo(0, scrollPos * 2)
//                 }
//             }

//             setCurrentScrollTopPosition(scrollTop)
//         })

//         return (
//             <>
//                 <div className="chat-content" ref={overlayRef} onScroll={((e : any) => scrollHandler(e.currentTarget))}>
//                     <div className="container-xxl">
//                         <ul className="list-unstyled py-4">
//                             { <ChatMessageItem msg={ChatMessage.getLoadingMessage(0)} ref={tombRef} key={0}/>}
//                             { curMsgs.map((msg) => <ChatMessageItem msg={msg} key={msg.inChatId} />) }

//                         </ul>
//                     </div>
//                 </div>
//             </>
//         )
//     }
// )
