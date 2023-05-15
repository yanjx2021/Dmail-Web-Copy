import { observer } from 'mobx-react-lite'
import { Chat, ChatType, chatStore } from '../../stores/chatStore'
import { action } from 'mobx'
import { GroupedVirtuoso } from 'react-virtuoso'
import { useCallback } from 'react'
import '../../styles/AllChats.css'
import { ChatSidebarHeader } from './ChatSidebarHeader'
import {
    UserSelector,
    createGroupFromAllFriendsSelectStore,
    userSelectStore,
} from '../MessagesBox/Selector'
import { User } from '../../stores/userStore'
import { modalStore } from '../../stores/modalStore'
import { Button } from 'antd'

//这里面直接内置通讯录就行

export const UserSidebarUsersItemCard = observer(({ user }: { user: User }) => {
    return (
        <a
            href="#"
            className="card"
            onClick={() => {
                userSelectStore.toggleCheckUser(user)
                createGroupFromAllFriendsSelectStore.reset()
            }}>
            <div className="card-body">
                <div className="media">
                    <div className="avatar me-3">
                        <span className="status rounded-circle"></span>
                        <div className={'avatar rounded-circle no-image ' + 'timber'}>
                            <img
                                className="avatar rounded-circle"
                                src={user.getAvaterUrl}
                                alt="avatar"
                            />
                        </div>
                    </div>
                    <div className="media-body overflow-hidden">
                        <div className="d-flex align-items-center mb-1">
                            <h6 className="text-truncate mb-0 me-auto">{user.showName}</h6>
                        </div>
                        <div className="text-truncate"></div>
                    </div>
                    <UserSelector user={user} />
                </div>
            </div>
        </a>
    )
})

export const UserSidebarUsersItem = observer(({ chat }: { chat: Chat }) => {
    if (!chat.bindUser) return <></>
    return (
        <li>
            <UserSidebarUsersItemCard user={chat.bindUser} />
        </li>
    )
})

export const UserSidebarUsersList = observer(() => {
    const { chats, groups, groupCounts } = chatStore.privateChatGroup
    const itemContent = useCallback(
        action((index: number) => {
            return <UserSidebarUsersItem chat={chats[index]} key={chats[index].chatId} />
        }),
        [chats]
    )
    return (
        <GroupedVirtuoso
            style={{ height: 500 }}
            className="chat-list"
            groupCounts={groupCounts}
            groupContent={(index) => <div>{groups[index]}</div>}
            itemContent={itemContent}
        />
    )
})

export const UserSidebar = observer(({ chat }: { chat: Chat }) => {
    const isPrivate = chat.chatType === ChatType.Private
    return (
        <div className="addnew-user-sidebar py-xl-4 py-3 px-xl-4 px-3">
            <div className="d-flex flex-column">
                {isPrivate ? (
                    <ChatSidebarHeader title="邀请好友创建群聊" chatId={chat.chatId} />
                ) : (
                    <ChatSidebarHeader title="邀请好友入群" chatId={chat.chatId} />
                )}
                <div className="body mt-4">
                    <div className="form-group input-group-lg search mb-3">
                        <i className="zmdi zmdi-search"></i>
                        <input type="text" className="form-control text-footerform" placeholder="搜索..." />
                    </div>
                    <UserSidebarUsersList />
                    <div className="text-center mt-3 mb-5">
                        <Button
                            onClick={action(() => {
                                if (userSelectStore.isEmpty) {
                                    userSelectStore.errors = '请选择一个好友，来邀请他/她加入群聊'
                                    return
                                }
                                if (isPrivate) {
                                    modalStore.modalType = 'CreateGroup'
                                    modalStore.isOpen = true
                                } else userSelectStore.inviteUsers(chat.chatId)
                            })}>
                            {isPrivate ? '创建群聊' : '邀请好友'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
})
