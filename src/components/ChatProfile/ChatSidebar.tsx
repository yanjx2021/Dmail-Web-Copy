import { observer } from 'mobx-react-lite'
import { Chat, ChatType } from '../../stores/chatStore'
import { ChatSidebarBody } from './ChatSidebarBody'
import { ChatSidebarHeader } from './ChatSidebarHeader'
import { action } from 'mobx'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'
import { useEffect } from 'react'

const getInfo = action((chat: Chat) => {
    if (chat.chatType === ChatType.Private) {
        MessageServer.Instance().send<Send.GetUserInfo>(Send.GetUserInfo, chat.bindUser!.userId)
    } else {
        // TODO-拉取群聊信息
    }
})


export const ChatSidebar = observer(({ chat }: { chat: Chat }) => {
    useEffect(() => {
        console.log('123')
        getInfo(chat)
    }, [chat])
    
    console.log(1234)
    return (
        <div className="user-detail-sidebar py-xl-4 py-3 px-xl-4 px-3">
            <div className="d-flex flex-column">
                <ChatSidebarHeader title={chat.sidebarTitle} />
                <ChatSidebarBody chat={chat}/>
            </div>
        </div>
    )
})
