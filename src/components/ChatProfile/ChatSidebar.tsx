import { observer } from 'mobx-react-lite'
import { Chat } from '../../stores/chatStore'
import { ChatSidebarBody } from './ChatSidebarBody'
import { ChatSidebarHeader } from './ChatSidebarHeader'

export const ChatSidebar = observer(({ chat }: { chat: Chat }) => {
    return (
        <div className="user-detail-sidebar py-xl-4 py-3 px-xl-4 px-3">
            <div className="d-flex flex-column">
                <ChatSidebarHeader title={chat.sidebarTitle} />
                <ChatSidebarBody chat={chat}/>
            </div>
        </div>
    )
})
