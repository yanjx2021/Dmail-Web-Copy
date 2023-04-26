import { observer } from 'mobx-react-lite'
import { Chat, ChatType, chatStore } from '../../stores/chatStore'
import { message, Button, Popconfirm, Modal } from 'antd'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'
import { User, userStore } from '../../stores/userStore'
import { useImmer } from 'use-immer'
import { requestStore } from '../../stores/requestStore'
import { ModalInput } from '../Box/Modal'
import { action } from 'mobx'
import { useEffect, useState } from 'react'
import { SidebarUserDropDown } from '../DropDown/SidebarUserDropDown'
import { authStore } from '../../stores/authStore'
import { modalStore } from '../../stores/modalStore'
import { updateGroupStore } from '../../stores/updateGroupStore'
import { CachedImage, imageStore } from '../../stores/imageStore'
import { Image } from 'antd'
import { UploadingFile, fileStore } from '../../stores/fileStore'


const ChatSidebarUserAvatar = observer(({user} : {user: User}) => {
    return (
        <>
            <div className="d-flex justify-content-center">
                <div className="avatar xxl">
                    <div className={'avatar xxl rounded-circle no-image ' + 'timber'}>
                        <Image
                            className="avatar xxl rounded-circle"
                            src={user.getAvaterUrl}
                            alt="avatar"
                        />
                    </div>
                </div>
            </div>
        </>
    )
})

const ChatSidebarAvatar = observer(
    ({ chat }: { chat: Chat }) => {
        const handleChange = (event: any) => {
            updateGroupStore.chat = chat
            event.target.files[0] &&
                fileStore.requestUpload(
                    event.target.files[0],
                    action((uploadingFile: UploadingFile) => {
                        updateGroupStore.newAvaterHash = uploadingFile.hash!
                        updateGroupStore.updateType = 'Avater'
                        updateGroupStore.sendUpdateGroupInfo()
                    })
                )
        }
        return (
            <>
                <div className="d-flex justify-content-center">
                    <div className="avatar xxl">
                        <div className={'avatar xxl rounded-circle no-image ' + 'timber'}>
                            <Image
                                className="avatar xxl rounded-circle"
                                src={chat.getAvaterUrl}
                                alt="avatar"
                            />
                        </div>
                    </div>
                </div>
                {chat.chatType !== ChatType.Private && chat.isAdmin(authStore.userId) && (
                    <input type="file" onChange={handleChange} />
                )}
            </>
        )
    }
)

const ChatSidebarName = observer(({ chat, visitUser }: { chat: Chat; visitUser: User | null }) => {
    if (visitUser) {
        return (
            <div className="text-center mt-3 mb-5">
                <h4>{visitUser.showName}</h4>
                <span className="text-muted">
                    {visitUser.nickname === '' ? <></> : <p>{`[用户名]: ${visitUser.name}`}</p>}
                    <a
                        className="__cf_email__"
                        data-cfemail="f4999d979c91989891da938691919ab49399959d98da979b99">
                        [email&#160;protected]
                    </a>
                </span>
            </div>
        )
    }

    return (
        <div className="text-center mt-3 mb-5">
            <h4>{chat.name}</h4>
            {chat.chatType === ChatType.Private ? (
                <span className="text-muted">
                    {chat.bindUser!.nickname === '' ? (
                        <></>
                    ) : (
                        <p>{`[用户名]: ${chat.bindUser!.name}`}</p>
                    )}
                    <a
                        className="__cf_email__"
                        data-cfemail="f4999d979c91989891da938691919ab49399959d98da979b99">
                        [email&#160;protected]
                    </a>
                </span>
            ) : (
                <></>
            )}
        </div>
    )
})

export const FriendshipButton = observer(({ userId }: { userId: number }) => {
    return chatStore.friendMap.has(userId) ? (
        <RemoveFriendButton userId={userId} />
    ) : (
        <AddFriendButton userId={userId} />
    )
})

export const AddFriendButton = observer(({ userId }: { userId: number }) => {
    const [isOpen, setIsOpen] = useImmer<boolean>(false)
    const [user, setUser] = useImmer<User>(userStore.getUser(userId))
    useEffect(() => {
        setUser(userStore.getUser(userId))
    }, [userId])
    return (
        <>
            <div className="text-center mt-3 mb-5">
                <Button onClick={() => setIsOpen(true)}>添加好友</Button>
            </div>
            <AddFriendModal
                userId={userId}
                userName={user.showName}
                setIsOpen={setIsOpen}
                isOpen={isOpen}
            />
        </>
    )
})

export const AddFriendModal = observer(
    ({
        userId,
        userName,
        setIsOpen,
        isOpen,
    }: {
        userId: number
        userName: string
        setIsOpen: any
        isOpen: boolean
    }) => {
        const handleCancel = () => {
            setIsOpen(false)
        }
        return (
            <Modal
                footer={[
                    <Button
                        key="send"
                        onClick={() => {
                            requestStore.sendMakeFriendRequest(userId)
                            handleCancel()
                        }}>
                        发送请求
                    </Button>,
                ]}
                onCancel={handleCancel}
                title={`正在添加${userName}为好友`}
                open={isOpen}>
                <ModalInput
                    type="text"
                    label="验证消息"
                    value={requestStore.message}
                    setValue={action((e: any) => (requestStore.message = e.target.value))}
                />
            </Modal>
        )
    }
)

export const RemoveFriendButton = ({ userId }: { userId: number }) => {
    return (
        <div className="text-center mt-3 mb-5">
            <Popconfirm
                title="你确定删除这个好友吗"
                okText="确定"
                cancelText="取消"
                onConfirm={() => {
                    MessageServer.Instance().send<Send.Unfriend>(Send.Unfriend, userId)
                }}>
                <Button>删除好友</Button>
            </Popconfirm>
        </div>
    )
}

export const QuitGroupButton = ({ chatId }: { chatId: number }) => {
    return (
        <div className="text-center mt-3 mb-5">
            <Popconfirm
                title="你确定退出群聊吗"
                okText="确定"
                cancelText="取消"
                onConfirm={() => {
                    MessageServer.Instance().send<Send.QuitGroupChat>(Send.QuitGroupChat, chatId)
                }}>
                <Button>退出群聊</Button>
            </Popconfirm>
        </div>
    )
}

export const GroupTitle = observer(({ chat }: { chat: Chat }) => {
    return (
        <div className="text-center mt-3 mb-5">
            <h4>
                {chat.name}
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={action(() => {
                        updateGroupStore.chat = chat
                        updateGroupStore.updateType = 'GroupName'
                        modalStore.modalType = 'ChangeGroupName'
                        modalStore.isOpen = true
                    })}>
                    <i className="zmdi zmdi-edit"></i>
                </button>
            </h4>

            <span className="text-muted"></span>
        </div>
    )
})

export const MembersHoverOption = ({ user, chat }: { user: User; chat: Chat }) => {
    return (
        <div className="hover_action">
            <SidebarUserDropDown user={user} chat={chat} />
        </div>
    )
}

export const UserCard = observer(
    ({ user, showHover, chat }: { user: User; showHover: boolean; chat: Chat }) => {
        return (
            <li>
                {showHover && <MembersHoverOption user={user} chat={chat} />}
                <a className="card">
                    <div className="card-body">
                        <div className="media">
                            <div className="avatar me-3">
                                <span className="rounded-circle"></span>
                                <div className="avatar rounded-circle no-image timber">
                                    <img className='avatar rounded-circle' src={user.getAvaterUrl} alt='avatar'/>
                                </div>
                            </div>
                            <div className="media-body overflow-hidden">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="text-truncate mb-0 me-auto">{user.showName}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </li>
        )
    }
)

const ChatList = observer(({ chat }: { chat: Chat }) => {
    return (
        <ul className="chat-list">
            <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                <span>群主</span>
            </li>
            {chat.ownerId && (
                <UserCard
                    key={chat.ownerId}
                    user={userStore.getUser(chat.ownerId)}
                    showHover={false}
                    chat={chat}
                />
            )}
            <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                <span>群管理员</span>
            </li>
            {chat.adminIds &&
                chat.adminIds
                    .filter((userId) => userId != chat.ownerId)
                    .map((userId, _) => {
                        const user = userStore.getUser(userId)
                        return (
                            <UserCard
                                key={userId}
                                user={user}
                                showHover={
                                    authStore.userId !== userId && authStore.userId === chat.ownerId
                                }
                                chat={chat}
                            />
                        )
                    })}
        </ul>
    )
})

const MemberList = observer(({ chat }: { chat: Chat }) => {
    return (
        <ul className="chat-list">
            <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                <span>群成员</span>
            </li>
            {chat.userIds &&
                chat.userIds.map((userId, _) => {
                    const user = userStore.getUser(userId)
                    return (
                        <UserCard
                            key={userId}
                            user={user}
                            showHover={
                                authStore.userId !== userId &&
                                (authStore.userId === chat.ownerId ||
                                    (chat.adminIds !== null &&
                                        chat.adminIds.indexOf(authStore.userId) > -1))
                            }
                            chat={chat}
                        />
                    )
                })}
        </ul>
    )
})

export const GroupMembers = ({ chat }: { chat: Chat }) => {
    return (
        <div className="tab-pane fade" id="GroupChat-Members" role="tabpanel">
            <MemberList chat={chat} />
        </div>
    )
}

export const GroupDetails = observer(({ chat }: { chat: Chat }) => {
    return (
        <div className="tab-pane fade active show" id="GroupChat-Details" role="tabpanel">
            <ChatSidebarAvatar chat={chat} />
            <GroupTitle chat={chat} />
            <ChatList chat={chat} />
        </div>
    )
})

export const SidebarTabContent = ({ chat }: { chat: Chat }) => {
    return (
        <div className="tab-content py-3" id="myTabContent">
            <GroupDetails chat={chat} />
            <GroupMembers chat={chat} />
        </div>
    )
}

export const HeaderTab = () => {
    return (
        <ul className="nav nav-tabs nav-overflow page-header-tabs">
            <li className="nav-item">
                <a className="nav-link" data-toggle="tab" href="#GroupChat-Details">
                    群聊信息
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" data-toggle="tab" href="#GroupChat-Members">
                    群聊成员
                </a>
            </li>
            <li className="nav-item">
                <a className="nav-link" data-toggle="tab" href="#GroupChat-Notices">
                    群聊公告
                </a>
            </li>
        </ul>
    )
}

export const ChatSidebarBody = observer(
    ({ chat, visitUser }: { chat: Chat; visitUser: User | null }) => {
        // TODO-后续群聊和用户可以复用
        if (visitUser) {
            // 群聊用户
            return (
                <div className="body mt-4">
                    <ChatSidebarUserAvatar user={visitUser}/>
                    <ChatSidebarName chat={chat} visitUser={visitUser} />
                    <FriendshipButton userId={visitUser.userId} />
                </div>
            )
        }
        if (chat.chatType === ChatType.Private) {
            // 私聊
            return (
                <div className="body mt-4">
                    <ChatSidebarAvatar chat={chat} />
                    <ChatSidebarName chat={chat} visitUser={visitUser} />
                    <FriendshipButton userId={chat.bindUser!.userId} />
                </div>
            )
        }
        return (
            // 群聊
            <div className="body">
                <HeaderTab />
                <SidebarTabContent chat={chat} />
                <QuitGroupButton chatId={chat.chatId} />
            </div>
        )
    }
)
