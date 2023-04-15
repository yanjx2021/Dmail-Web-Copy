import { observer } from 'mobx-react-lite'
import { Chat, ChatId, ChatStore, ChatType } from '../stores/chatStore'
import { action } from 'mobx'
import { CreateGroupChatBox } from './Box/CreateGroupChatBox'
import { AddFriendBox } from './Box/AddFriendBox'
import '../styles/RecentRequests.css'
import { GroupedVirtuoso, Virtuoso } from 'react-virtuoso'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { userSettingStore } from '../stores/userSettingStore'

export const AllChatsCard = observer(
    ({
        chat,
        activeChatId,
        setActiveChatId,
    }: {
        chat: Chat
        activeChatId: ChatId | null
        setActiveChatId: (chatId: ChatId) => any
    }) => {
        const [editName, setEditName] = useImmer(false)
        const [nickname, setNickname] = useImmer(chat.name)
        const inputRef: any = useRef(null)

        const onKeyDown = useCallback(
            action((e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    userSettingStore.setUserNickName(chat.bindUser!.userId, nickname)
                    setEditName(false)
                }
            }),
            [nickname]
        )
        const handleOnBlur = () => setEditName(false)
        const handleDoubleClick = action(() => {
            if (chat.chatType === ChatType.Private) {
                setEditName(true)
            }
        })

        useEffect(() => {
            if (editName) inputRef.current.focus()
        }, [editName])

        useEffect(() => {
            if (editName) {
                window.addEventListener('keydown', onKeyDown)
                return () => window.removeEventListener('keydown', onKeyDown)
            }
        }, [editName, onKeyDown])

        return (
            <a className="card" onClick={action(() => setActiveChatId(chat.chatId))}>
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>{chat.name.slice(0, Math.min(2, chat.name.length))}</span>
                            </div>
                        </div>
                        <div
                            className="media-body overflow-hidden"
                            onDoubleClick={handleDoubleClick}>
                            {editName ? (
                                <input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    ref={inputRef}
                                    onBlur={handleOnBlur}
                                />
                            ) : (
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="text-truncate mb-0 me-auto">{chat.name}</h6>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        )
    }
)

export const HoverOption = observer(({ chat }: { chat: Chat }) => {
    // 鼠标悬停，出现查看用户或群聊信息功能
    const type = chat.chatType === ChatType.Private ? 'private' : 'group' // 用于导航到对应的infoBox
    return (
        <div className="hover_action">
            <button type="button" className="btn btn btn-link">
                {type === 'private' ? '用户主页' : '群聊信息'}
            </button>
        </div>
    )
})

export const AllChatsItem = observer(
    ({
        chat,
        activeChatId,
        setActiveChatId,
    }: {
        chat: Chat
        activeChatId: ChatId | null
        setActiveChatId: (chatId: ChatId) => any
    }) => {
        return (
            <li className={activeChatId === chat.chatId ? 'online active' : ''}>
                <HoverOption chat={chat} />
                <AllChatsCard
                    chat={chat}
                    activeChatId={activeChatId}
                    setActiveChatId={setActiveChatId}
                />
            </li>
        )
    }
)

export const AllChatContent = observer(
    ({
        chatStore,
        activeChatId,
        setActiveChatId,
    }: {
        chatStore: ChatStore
        activeChatId: ChatId | null
        setActiveChatId: (chatId: ChatId) => any
    }) => {
        const { chats, groups, groupCounts } = chatStore.privateChatGroup
        const itemContent = useCallback(
            action((index: number) => {
                return (
                    <AllChatsItem
                        chat={chats[index]}
                        activeChatId={activeChatId}
                        setActiveChatId={setActiveChatId}
                        key={chats[index].chatId}
                    />
                )
            }),
            [chats, activeChatId, setActiveChatId]
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
    }
)

export const AllChatList = ({
    chatStore,
    activeChatId,
    setActiveChatId,
}: {
    chatStore: ChatStore
    activeChatId: ChatId | null
    setActiveChatId: (chatId: ChatId) => any
}) => {
    return (
        <>
            <div className="tab-pane fade" id="nav-tab-contact" role="tabpanel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 text-primary">通讯录</h3>
                </div>
                <div className="form-group input-group-lg search mb-3">
                    <i className="zmdi zmdi-search"></i>
                    <i className="zmdi zmdi-dialpad"></i>
                    <input className="form-control" type="text" placeholder="搜索..."></input>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <a
                            className="btn btn-dark"
                            type="button"
                            data-toggle="modal"
                            data-target="#InviteFriendsAllChat">
                            <i className="zmdi zmdi-account-add" />
                            添加好友
                        </a>
                    </div>
                    <div>
                        <a
                            className="btn btn-dark"
                            type="button"
                            data-toggle="modal"
                            data-target="#InviteFriendsAllChat">
                            <i className="zmdi zmdi-account-add" />
                            加入群聊
                        </a>
                    </div>
                    <div>
                        <a
                            className="btn btn-dark"
                            type="button"
                            data-toggle="modal"
                            data-target="#CreateGroupAllChat">
                            <i className="zmdi zmdi-account-add" />
                            创建群聊
                        </a>
                    </div>
                </div>

                <AllChatContent
                    chatStore={chatStore}
                    activeChatId={activeChatId}
                    setActiveChatId={setActiveChatId}
                />
            </div>
            <AddFriendBox id="InviteFriendsAllChat" />
            <CreateGroupChatBox id="CreateGroupAllChat" />
        </>
    )
}
