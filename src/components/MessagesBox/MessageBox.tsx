import { observer } from 'mobx-react-lite'
import { ChatMessage } from '../../stores/chatStore'
import { Virtuoso } from 'react-virtuoso'
import { useCallback, useEffect, useRef } from 'react'
import { action } from 'mobx'
import { ChatMessageBoxItem } from './MessageBoxItem'
import { useImmer } from 'use-immer'

export const MessageBox = observer(({ msgs, userId }: { msgs: ChatMessage[]; userId: number }) => {
    const virtuosoRef: any = useRef(null)
    const [messages, setMessages] = useImmer<ChatMessage[]>(msgs.slice())

    useEffect(
        action(() => {
            setMessages(msgs.slice())
        }),
        [msgs]
    )

    const itemContent = useCallback(
        action((_: number, message: ChatMessage) => {
            return <ChatMessageBoxItem msg={message} key={message.inChatId} userId={userId} />
        }),
        []
    )

    return messages.length === 0 ? (
        <div>没有!</div>
    ) : (
        <Virtuoso
            style={{ height: '400px' }}
            className="container-xxl list-unstyled py-4"
            ref={virtuosoRef}
            firstItemIndex={messages.length}
            data={messages}
            itemContent={itemContent}
        />
    )
})
