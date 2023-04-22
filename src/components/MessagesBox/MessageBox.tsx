import { observer } from 'mobx-react-lite'
import { ChatMessage } from '../../stores/chatStore'
import { Virtuoso } from 'react-virtuoso'
import { useCallback, useRef } from 'react'
import { action, makeAutoObservable } from 'mobx'
import { ChatMessageItem } from '../ChatView/ChatMessageItem'
import { ChatMessageBoxItem } from './MessageBoxItem'

export const MessageBox = observer(({ msgs, userId }: { msgs: ChatMessage[], userId: number }) => {
    const virtuosoRef: any = useRef(null)

    const itemContent = useCallback(
        action((_: number, message: ChatMessage) => {
            return <ChatMessageBoxItem msg={message} key={message.inChatId} userId={userId} />
        }),
        []
    )

    return (
        <Virtuoso
            style={{height: '400px'}}
            className="container-xxl list-unstyled py-4"
            ref={virtuosoRef}
            firstItemIndex={msgs.length}
            data={msgs}
            itemContent={itemContent}
        />
    )
})
