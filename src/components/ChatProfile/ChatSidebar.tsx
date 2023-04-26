import { observer } from 'mobx-react-lite'
import { Chat, ChatType } from '../../stores/chatStore'
import { ChatSidebarBody } from './ChatSidebarBody'
import { ChatSidebarHeader } from './ChatSidebarHeader'
import { action } from 'mobx'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'
import { useEffect } from 'react'
import { User } from '../../stores/userStore'
import { useImmer } from 'use-immer'
import { groupChatManageStore } from '../../stores/groupChatManageStore'
import { chatSideStore } from '../../stores/chatSideStore'

const getInfo = action((chat: Chat) => {
    console.log('拉取')
    if (chat.chatType === ChatType.Private) {
        MessageServer.Instance().send<Send.GetUserInfo>(Send.GetUserInfo, chat.bindUser!.userId)
    } else {
        groupChatManageStore.sendGetGroupManage(chat.chatId)
        // TODO-拉取群聊信息
    }
})

export const ChatSidebar = observer(
    ({ chat, visitUser }: { chat: Chat; visitUser: User | null }) => {
        const [title, setTitle] = useImmer<string>('')

        useEffect(
            action(action(() => {
                chatSideStore.open && getInfo(chat)
                setTitle(chat.sidebarName)
            })),
            [chat, chatSideStore.open]
        )

        useEffect(
            action(() => {
                visitUser &&
                    MessageServer.Instance().send<Send.GetUserInfo>(
                        Send.GetUserInfo,
                        visitUser.userId
                    )
            }),
            [visitUser]
        )
        if (visitUser !== null) // 查看群成员
            return (
                <div className="user-detail-sidebar py-xl-4 py-3 px-xl-4 px-3">
                    <div className="d-flex flex-column">
                        <ChatSidebarHeader title={'用户信息'} chatId={chat.chatId} />
                        <ChatSidebarBody chat={chat} visitUser={visitUser} />
                    </div>
                </div>
            )

        return ( // 群聊
            <div className="user-detail-sidebar py-xl-4 py-3 px-xl-4 px-3">
                <div className="d-flex flex-column">
                    <ChatSidebarHeader title={title} chatId={chat.chatId} />
                    <ChatSidebarBody chat={chat} visitUser={visitUser} />
                </div>
            </div>
        )
    }
)
