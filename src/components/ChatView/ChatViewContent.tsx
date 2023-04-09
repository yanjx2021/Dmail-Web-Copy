import { useEffect, useRef, useState, useCallback } from 'react'
import { Chat, ChatMessage, ChatMessageState } from '../../stores/chatStore'
import { ChatMessageItem } from './ChatMessageItem'
import { action, autorun, observe, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Virtuoso } from 'react-virtuoso'
import { useFetcher } from 'react-router-dom'

export const ChatMessageContent = observer(
    ({chat, messages, setMessages}: { chat: Chat, messages : ChatMessage[], setMessages : any }) => {
        const virtuosoRef : any = useRef(null)
        const [firstItemIndex, setFirstItemIndex] = useState(chat.lastMessage!.inChatId!)
        
        const autoUpdateDisposer : any = useRef(null)

        const [atBottom, setAtBottom] = useState(false)
        const showButtonTimeoutRef : any = useRef(null)
        const [showButton, setShowButton] = useState(false)

        const prependItems = useCallback(() => {
            const messagesToPrepend = 20
            const nextFirstItemIndex = firstItemIndex - messagesToPrepend
        
            setFirstItemIndex(() => nextFirstItemIndex)
            setMessages(() => [...chat.getMessages(firstItemIndex - 1, messagesToPrepend), ...messages])

            return false
          }, [chat, firstItemIndex, messages, setMessages])
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const itemContent = useCallback(
            action((index : number, message : ChatMessage) => <ChatMessageItem msg={message} key={message.inChatId}/>)
        , [])

        useEffect(() => {
            // For Test
            // setInterval(action(() => {
            //     setMessages((messages) => [...messages, ChatMessage.getLoadingMessage(messages[messages.length - 1].inChatId + 1)])
            // }), 700)
            if (autoUpdateDisposer.current) {
                autoUpdateDisposer.current()
                autoUpdateDisposer.current = null
            }

            autoUpdateDisposer.current = autorun(() => {
                if (!chat.lastMessage) {
                    return
                }

                let index = messages.length - 1;
                while (index >= 0 && messages[index].state !== ChatMessageState.Arrived) {
                    index--;
                }

                if (index === -1) {
                    setMessages(() => [...messages, ...chat.getMessages( chat.lastMessage!.inChatId!, chat.lastMessage!.inChatId!)])
                    return
                } 
                const lastMessage = messages[index]

                const delta = chat.lastMessage!.inChatId! - lastMessage.inChatId!
                if (delta > 0) {
                    setMessages(() => [...messages, ...chat.getMessages( chat.lastMessage!.inChatId!, delta)])
                }
            })

            return autoUpdateDisposer.current
            // 这里不应该加入对Messages的依赖，Messages的主动更新仅会向前加入消息
        }, [chat, messages, setMessages])

        useEffect( () => {
            if (!atBottom) {
                showButtonTimeoutRef.current = setTimeout(() => setShowButton(true), 500)
            } else {
                setShowButton(false)
            }
        }, [atBottom])
        
        return (
            <>
            <Virtuoso className="chat-content container-xxl list-unstyled py-4"
                ref={virtuosoRef}
                firstItemIndex={firstItemIndex}
                initialTopMostItemIndex={chat.lastMessage!.inChatId}
                data={messages}
                startReached={prependItems}
                itemContent={itemContent}
                atBottomStateChange={(bottom) => setAtBottom(bottom)}
                followOutput={'auto'}
            />
            { showButton && (
                <button
                  onClick={() => virtuosoRef!.current.scrollToIndex({ index: messages.length - 1, behavior: 'smooth' })}
                  style={{ float: 'right', transform: 'translate(60rem, -1rem)', width : '3'}}
                >
                  Bottom
                </button>
              ) }
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

