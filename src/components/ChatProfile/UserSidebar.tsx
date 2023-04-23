import { observer } from 'mobx-react-lite'
import { Chat, ChatType, chatStore } from '../../stores/chatStore'
import { action } from 'mobx'
import { chatSideStore } from '../../stores/chatSideStore'
import { GroupedVirtuoso } from 'react-virtuoso'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useImmer } from 'use-immer'
import '../../styles/AllChats.css'
import { ChatSidebarHeader } from './ChatSidebarHeader'
import { UserSelector, userSelectStore } from '../MessagesBox/Selector'
import { User } from '../../stores/userStore'
import { modalStore } from '../../stores/modalStore'

//这里面直接内置通讯录就行

export const UserSidebarUsersItemCard = observer(({ user }: { user: User }) => {
    return (
        <a href="#" className="card" onClick={() => userSelectStore.toggleCheckUser(user)}>
            <div className="card-body">
                <div className="media">
                    <div className="avatar me-3">
                        <span className="status rounded-circle"></span>
                        <div className={'avatar rounded-circle no-image ' + 'timber'}>
                            <span>{user.userId}</span>
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
                    <ChatSidebarHeader title="邀请好友创建群聊" />
                ) : (
                    <ChatSidebarHeader title="邀请好友入群" />
                )}
                <div className="body mt-4">
                    <button
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
                    </button>
                    <div className="form-group input-group-lg search mb-3">
                        <i className="zmdi zmdi-search"></i>
                        <input type="text" className="form-control" placeholder="搜索..." />
                    </div>
                    <UserSidebarUsersList />
                </div>
            </div>
        </div>
    )
})
