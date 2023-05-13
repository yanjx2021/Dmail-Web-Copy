import { observer } from 'mobx-react-lite'
import { Chat, ChatId, ChatStore, chatStore } from '../stores/chatStore'
import { action, autorun } from 'mobx'
import { ChatDropDown } from './DropDown/ChatDropDown'
import { Badge } from 'antd'
import { HoverOption } from './AllChats'
import { ChatSelector, messageSelectStore } from './MessagesBox/Selector'
import { secureAuthStore } from '../stores/secureAuthStore'
import { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { notificationStore } from '../stores/notificationStore'
import { rtcStore } from '../stores/rtcStore'

const RecentChatItem = observer(
    ({
        chat,
        activeChatId,
        setActiveChatId,
    }: {
        chat: Chat
        activeChatId: ChatId | null
        setActiveChatId: (chatId: ChatId) => any
    }) => {
        useEffect(
            action(() => {
                if (chat.unreadCount !== 0) {
                    notificationStore.showNotification(
                        chat.chatId,
                        chat.name,
                        `您有${chat.unreadCount}条未读消息`
                    )
                }
            }),
            [chat.unreadCount]
        )

        return (
            <li className={activeChatId === chat.chatId ? 'online active' : ''}>
                <HoverOption chat={chat} />

                <a className="card" onClick={action(() => setActiveChatId(chat.chatId))}>
                    <div className="card-body">
                        <div className="media">
                            {/* TODO: yjx 将显示置顶状态的图标和免打扰的图标变得好看一点，并且放到一个心仪的位置 */}
                            {/* TopIcon Start */}
                            {chatStore.isTopChat(chat.chatId) && <i className='zmdi zmdi-star'></i>}
                            {notificationStore.hasMuted(chat.chatId) && <i className='zmdi zmdi-eye'></i>}
                            {/* TopIcon End */}
                            <div className="avatar me-3">
                                <Badge count={chat.unreadCount}>
                                    <span className="rounded-circle"></span>
                                    <div className="avatar rounded-circle no-image timber">
                                        <img
                                            className="avatar rounded-circle"
                                            src={chat.getAvaterUrl}
                                            alt="avatar"
                                        />
                                    </div>
                                </Badge>
                            </div>

                            <div className="media-body overflow-hidden">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="text-truncate mb-0 me-auto">{chat.name}</h6>
                                    <p className="small text-muted text-nowrap ms-4 mb-0">
                                        {chat.lastMessage !== undefined ? (
                                            new Date(chat.lastMessage.timestamp).toLocaleString()
                                        ) : (
                                            <></>
                                        )}
                                    </p>
                                </div>
                                <div className="text-truncate">
                                    {chat.lastMessage !== undefined ? chat.lastMessage.asShort : ''}
                                </div>
                                {chat.atYou ? <p className="text-danger">有人@你</p> : <></>}
                                {rtcStore.remoteUserId === chat.bindUser?.userId &&
                                    rtcStore.type === 'Voice' && (
                                        <p>
                                            语音通话中
                                            <div className="wave">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        </p>
                                    )}
                                {rtcStore.remoteUserId === chat.bindUser?.userId &&
                                    rtcStore.type === 'Video' && (
                                        <p>
                                            视频通话中
                                            <div className="wave">
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                                <span className="dot"></span>
                                            </div>
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </a>
            </li>
        )
    }
)

export const RecentChats = observer(
    ({
        chatStore,
        activeChatId,
        setActiveChatId,
    }: {
        chatStore: ChatStore
        activeChatId: ChatId | null
        setActiveChatId: (chatId: ChatId) => any
    }) => {
        return (
            <div className="tab-pane fade show active" id="nav-tab-chat" role="tabpanel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 text-primary">聊天</h3>
                </div>
                <div className="form-group input-group-lg search mb-3">
                    <i className="zmdi zmdi-search"></i>
                    <i className="zmdi zmdi-dialpad"></i>
                    <input
                        className="form-control text-footerform"
                        type="text"
                        placeholder="搜索..."></input>
                </div>
                <ul className="chat-list">
                    <li
                        key="chatTitle"
                        className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                        <span>最近的对话</span>
                    </li>
                    {chatStore.recentChatsView.map(action((chat) => (
                        <RecentChatItem
                            chat={chat}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                            key={chat.chatId}
                        />
                    )))}
                </ul>
            </div>
        )
    }
)
