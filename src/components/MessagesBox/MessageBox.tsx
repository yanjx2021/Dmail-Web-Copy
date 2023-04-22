import { observer } from 'mobx-react-lite'
import { ChatMessage } from '../../stores/chatStore'
import { Virtuoso } from 'react-virtuoso'
import { useCallback, useRef } from 'react'
import { action, makeAutoObservable } from 'mobx'
import { ChatMessageItem } from '../ChatView/ChatMessageItem'

export const MessageBox = observer(({ msgs }: { msgs: ChatMessage[] }) => {
    const virtuosoRef: any = useRef(null)

    const itemContent = useCallback(
        action((_: number, message: ChatMessage) => {
            return <ChatMessageItem msg={message} key={message.inChatId} enableDropDown={false} />
        }),
        []
    )

    return (
        <Virtuoso
            style={{height: '900px'}}
            className="container-xxl list-unstyled py-4"
            ref={virtuosoRef}
            firstItemIndex={msgs.length}
            data={msgs}
            itemContent={itemContent}
        />
    )
})
