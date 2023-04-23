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
import { useEffect } from 'react'

const ChatSidebarAvatar = ({ id }: { id: number }) => {
    return (
        <div className="d-flex justify-content-center">
            <div className="avatar xxl">
                <span className="status xxl rounded-circle"></span>
                <div className={'avatar xxl rounded-circle no-image ' + 'timber'}>
                    <span>{id}</span>
                </div>
            </div>
        </div>
    )
}

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

export const GroupUserItem = ({ userId }: { userId: number }) => {
    return <li>{userId}</li>
}

export const GroupUserList = observer(({ chat }: { chat: Chat }) => {
    return (
        <ul>
            {chat.userIds!.map((userId) => (
                <GroupUserItem key={userId} userId={userId} />
            ))}
        </ul>
    )
})

export const ChatSidebarBody = observer(
    ({ chat, visitUser }: { chat: Chat; visitUser: User | null }) => {
        // TODO-后续群聊和用户可以复用
        if (visitUser) {
            return (
                <div className="body mt-4">
                    <ChatSidebarAvatar id={visitUser.userId} />
                    <ChatSidebarName chat={chat} visitUser={visitUser} />
                    <FriendshipButton userId={visitUser.userId} />
                </div>
            )
        }

        return (
            <div className="body mt-4">
                <ChatSidebarAvatar
                    id={chat.chatType === ChatType.Private ? chat.bindUser!.userId : chat.chatId}
                />
                <ChatSidebarName chat={chat} visitUser={visitUser} />
                {chat.chatType === ChatType.Private ? (
                    <FriendshipButton userId={chat.bindUser!.userId} />
                ) : (
                    <>
                        <GroupUserList chat={chat} />
                    </>
                )}
            </div>
        )
    }
)
