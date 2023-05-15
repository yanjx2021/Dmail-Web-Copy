import { observer } from 'mobx-react-lite'
import { ModalStore, modalStore } from '../../stores/modalStore'
import { Button, Checkbox, Modal, Select, Space, message } from 'antd'
import { useImmer } from 'use-immer'
import { requestStore } from '../../stores/requestStore'
import { action } from 'mobx'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'
import { updateUserStore } from '../../stores/updateUserStore'
import { EmailCodeInput } from '../EmailCodeInput'
import { authStore } from '../../stores/authStore'
import { userSettingStore } from '../../stores/userSettingStore'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { secondaryCodeHash } from '../../constants/passwordHash'
import { ChatSelector, messageSelectStore } from '../MessagesBox/Selector'
import {
    Chat,
    ChatMessage,
    ChatMessageType,
    ChatType,
    ReplyTextContent,
    chatStore,
} from '../../stores/chatStore'
import { MessageBox } from '../MessagesBox/MessageBox'
import { useEffect } from 'react'
import '../../styles/Modal.css'
import { updateGroupStore } from '../../stores/updateGroupStore'
import { User, userStore } from '../../stores/userStore'
import { getUserIdStore } from '../../stores/getUserIdStore'
import { AddFriendModal, manageGroupNoticeStore } from '../ChatProfile/ChatSidebarBody'
import { type } from 'os'
import { chatSideStore } from '../../stores/chatSideStore'

export const ModalInput = ({
    label,
    type,
    value,
    setValue,
    placeholder,
}: {
    label: string
    type: 'text' | 'password'
    value: string
    setValue: any
    placeholder: string
}) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                className="form-control form-control-lg form-margin"
                value={value}
                onChange={setValue}
                placeholder={placeholder}
            />
        </div>
    )
}

export const JoinGroupModalView = observer(({ title }: { title: string }) => {
    const [reqId, setReqId] = useImmer<string>('')
    return (
        <Modal
            footer={[
                <Button
                    key="send"
                    onClick={() => {
                        requestStore.sendJoinGroupRequest(parseInt(reqId) ? parseInt(reqId) : null)
                        setReqId('')
                    }}>
                    发送请求
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="群聊ID"
                value={reqId}
                setValue={(e: any) => {
                    const input = e.target.value.replace(/[^0-9]/g, '')
                    setReqId(input)
                }}
                placeholder="请输入群聊ID..."
            />
            <ModalInput
                type="text"
                label="验证消息"
                value={requestStore.message}
                setValue={action((e: any) => (requestStore.message = e.target.value))}
                placeholder="请输入验证消息..."
            />
        </Modal>
    )
})

export const AddFriendModalView = observer(({ title }: { title: string }) => {
    const [reqId, setReqId] = useImmer<string>('')
    return (
        <Modal
            footer={[
                <Button
                    key="send"
                    onClick={() => {
                        requestStore.sendMakeFriendRequest(parseInt(reqId) ? parseInt(reqId) : null)
                        setReqId('')
                    }}>
                    发送请求
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="用户ID"
                value={reqId}
                setValue={(e: any) => {
                    const input = e.target.value.replace(/[^0-9]/g, '')
                    setReqId(input)
                }}
                placeholder="请输入用户ID..."
            />
            <ModalInput
                type="text"
                label="验证消息"
                value={requestStore.message}
                setValue={action((e: any) => (requestStore.message = e.target.value))}
                placeholder="请输入验证消息..."
            />
        </Modal>
    )
})

export const CreateGroupModalView = observer(({ title }: { title: string }) => {
    const [groupName, setGroupName] = useImmer<string>('')
    return (
        <Modal
            footer={[
                <Button
                    key="create"
                    onClick={() => {
                        MessageServer.Instance().send<Send.CreateGroupChat>(Send.CreateGroupChat, {
                            name: groupName,
                            avaterHash: '',
                        })
                        setGroupName('')
                        modalStore.handleCancel()
                    }}>
                    创建群聊
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="群聊名称"
                value={groupName}
                setValue={(e: any) => {
                    setGroupName(e.target.value)
                }}
                placeholder="请输入群聊名称..."
            />
        </Modal>
    )
})

export const ChangePasswordModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[
                <Button
                    key="set"
                    onClick={action(() => {
                        updateUserStore.updateType = 'Password'
                        updateUserStore.sendUpdateUserInfo()
                    })}>
                    设置新密码
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="password"
                label="新密码"
                value={updateUserStore.newPassword}
                setValue={action((e: any) => {
                    updateUserStore.newPassword = e.target.value
                })}
                placeholder="请输入新密码..."
            />
            <div className="form-group">
                <label>验证消息</label>
                <EmailCodeInput
                    email={authStore.email}
                    emailCode={updateUserStore.emailCode}
                    setErrors={action((error) => (updateUserStore.errors = error))}
                    setEmailCode={action((data) => (updateUserStore.emailCode = data))}
                />
            </div>
        </Modal>
    )
})

export const SetSecureModalView = observer(({ title }: { title: string }) => {
    const [code, setCode] = useImmer<string>('')
    const [oldCode, setOldCode] = useImmer<string>('')
    return (
        <Modal
            footer={[
                <Button
                    key="setSecure"
                    onClick={action(() => {
                        if (secureAuthStore.hasSetCode) {
                            if (
                                userSettingStore.getSecondaryCode(secureAuthStore.chatId) !==
                                secondaryCodeHash(oldCode)
                            ) {
                                secureAuthStore.errors = '原密码错误，无权更改'
                                setOldCode('')
                                setCode('')
                                return
                            }
                            setOldCode('')
                        }
                        if (code === '') {
                            secureAuthStore.errors = '二级密码不能为空'
                            return
                        }
                        userSettingStore.setChatVerify(
                            secureAuthStore.chatId,
                            secondaryCodeHash(code)
                        )
                        setCode('')
                        modalStore.handleCancel()
                    })}>
                    设置聊天密码
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            {secureAuthStore.hasSetCode ? (
                <ModalInput
                    type="password"
                    label="原密码"
                    value={oldCode}
                    setValue={action((e: any) => {
                        setOldCode(e.target.value)
                    })}
                    placeholder="请输入原密码..."
                />
            ) : (
                <></>
            )}
            <ModalInput
                type="password"
                label={secureAuthStore.hasSetCode ? '新密码' : '设置密码'}
                value={code}
                setValue={action((e: any) => {
                    setCode(e.target.value)
                })}
                placeholder={secureAuthStore.hasSetCode ? '请输入新密码...' : '请设置密码...'}
            />
        </Modal>
    )
})

export const RemoveSecureModalView = observer(({ title }: { title: string }) => {
    const [code, setCode] = useImmer<string>('')
    return (
        <Modal
            footer={[
                <Button
                    key="remove"
                    onClick={action(() => {
                        if (
                            userSettingStore.getSecondaryCode(secureAuthStore.chatId) !==
                            secondaryCodeHash(code)
                        ) {
                            secureAuthStore.errors = '原密码错误，无权取消二级密码'
                            setCode('')
                            return
                        }
                        userSettingStore.setChatVerify(secureAuthStore.chatId, '')
                        setCode('')
                        modalStore.handleCancel()
                    })}>
                    确认取消
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="password"
                label="原密码"
                value={code}
                setValue={action((e: any) => {
                    setCode(e.target.value)
                })}
                placeholder="请输入原密码..."
            />
        </Modal>
    )
})

export const ChatSelectCard = observer(({ chat }: { chat: Chat }) => {
    return (
        <li>
            <a className="card" onClick={action(() => messageSelectStore.toggleCheckChat(chat))}>
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>{chat.name.slice(0, Math.min(2, chat.name.length))}</span>
                            </div>
                        </div>

                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">{chat.name}</h6>
                            </div>
                        </div>
                        <Checkbox checked={messageSelectStore.hasSelectChat(chat)} />
                    </div>
                </div>
            </a>
        </li>
    )
})

export const TransferChatModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[
                <Button
                    key="transfer"
                    onClick={action(() => {
                        messageSelectStore.transfer()
                    })}>
                    确认转发
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            {chatStore.recentChatsView.map((chat) => (
                <ChatSelectCard chat={chat} key={chat.chatId} />
            ))}
        </Modal>
    )
})

export const TransferChatBoxModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <MessageBox
                msgs={modalStore.transferData!.messages}
                userId={modalStore.transferData!.userId}
            />
        </Modal>
    )
})

export const ChangeGroupNameModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[
                <Button
                    key="remove"
                    onClick={() => {
                        updateGroupStore.sendUpdateGroupInfo()
                        console.log('111')
                    }}>
                    确认更改
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="新的群名"
                value={updateGroupStore.newGroupName}
                setValue={action((e: any) => {
                    updateGroupStore.newGroupName = e.target.value
                })}
                placeholder="请输入新的群名..."
            />
        </Modal>
    )
})

export const GroupMessageReadersModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[
                <Button key="okok" onClick={modalStore.handleCancel}>
                    确认
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            {modalStore.groupMessageReaders ? (
                <ul>
                    {modalStore.groupMessageReaders.map((userId) => (
                        <li key={userId}>
                            <p>{userStore.getUser(userId).name}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p> 加载中</p>
            )}
        </Modal>
    )
})

const FindUserCard = observer(({ user, handleClick }: { user: User; handleClick: any }) => {
    const [isOpen, setIsOpen] = useImmer<boolean>(false)
    return (
        <li>
            {' '}
            <a className="card">
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <img
                                    className="avatar rounded-circle"
                                    src={user.getAvaterUrl}
                                    alt="avatar"
                                />
                            </div>
                        </div>
                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">{`${user.name}(ID: ${user.userId})`}</h6>
                            </div>
                        </div>
                        {!chatStore.friendMap.has(user.userId) &&
                            user.userId !== authStore.userId && (
                                <button
                                    className="ant-btn css-dev-only-do-not-override-1mqg3i0 ant-btn-default"
                                    onClick={() => {
                                        setIsOpen(true)
                                    }}>
                                    添加好友
                                </button>
                            )}
                    </div>
                </div>
            </a>
            <AddFriendModal
                userId={user.userId}
                userName={user.name}
                setIsOpen={setIsOpen}
                isOpen={isOpen}
            />
        </li>
    )
})

export const GetUserIdModalView = observer(({ title }: { title: string }) => {
    const [userName, setUserName] = useImmer<string>('')

    return (
        <Modal
            footer={[
                <Button
                    key="close"
                    onClick={() => {
                        getUserIdStore.reset()
                        getUserIdStore.findUser(userName)
                    }}>
                    查找
                </Button>,
            ]}
            onCancel={action(() => {
                modalStore.handleCancel()
                getUserIdStore.reset()
                setUserName('')
            })}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="查找用户"
                value={userName}
                setValue={action((e: any) => {
                    setUserName(e.target.value)
                })}
                placeholder="请输入查找用户名..."
            />
            <h5>搜索结果</h5>
            <ul className="chat-list">
                {getUserIdStore.userIds?.length === 0 ? (
                    <li key={0}>未找到该用户</li>
                ) : (
                    getUserIdStore.users?.map((user) => (
                        <FindUserCard
                            user={user}
                            key={user.userId}
                            handleClick={action(() => {
                                modalStore.handleCancel()
                                getUserIdStore.reset()
                                setUserName('')
                            })}
                        />
                    ))
                )}
            </ul>
        </Modal>
    )
})

export const SendGroupNoticeModalView = observer(({ title }: { title: string }) => {
    const [notice, setNotice] = useImmer<string>('')

    return (
        <Modal
            footer={[
                <Button
                    key="close"
                    onClick={action(() => {
                        manageGroupNoticeStore.chat?.sendGroupChatNotice(notice)
                        setNotice('')
                    })}>
                    发送
                </Button>,
            ]}
            onCancel={action(() => {
                modalStore.handleCancel()
                manageGroupNoticeStore.reset()
            })}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="群公告内容"
                value={notice}
                setValue={action((e: any) => {
                    setNotice(e.target.value)
                })}
                placeholder="请输入群公告内容..."
            />
        </Modal>
    )
})

export const ReplyMessageModalView = observer(({ title }: { title: string }) => {
    const [reply, setReply] = useImmer<string>('')

    return (
        <Modal
            footer={[
                <Button
                    key="close"
                    onClick={action(() => {
                        if (!modalStore.replyMessageId) {
                            console.error('未选中应该回复的消息')
                        }
                        modalStore.sendReplyMessageHandler(modalStore.replyMessageId, reply)
                        setReply('')
                    })}>
                    发送
                </Button>,
            ]}
            onCancel={action(() => {
                modalStore.handleCancel()
                manageGroupNoticeStore.reset()
            })}
            title={title}
            open={modalStore.isOpen}>
            <ModalInput
                type="text"
                label="回复消息"
                placeholder="请输入消息..."
                value={reply}
                setValue={action((e: any) => {
                    setReply(e.target.value)
                })}
            />
        </Modal>
    )
})

export const LogOffModalView = observer(({ title }: { title: string }) => {
    return (
        <Modal
            footer={[
                <Button
                    key="set"
                    onClick={action(() => {
                        authStore.logoff()
                    })}>
                    注销
                </Button>,
            ]}
            onCancel={modalStore.handleCancel}
            title={title}
            open={modalStore.isOpen}>
            <div className="form-group">
                <EmailCodeInput
                    email={authStore.email}
                    emailCode={authStore.emailCode}
                    setErrors={action((error) => (authStore.errors = error))}
                    setEmailCode={action((data) => (authStore.emailCode = data))}
                />
            </div>
        </Modal>
    )
})

export type TypeSelect = 'none' | 'file' | 'image' | 'audio'

export const SelectMessageModalView = observer(({ title }: { title: string }) => {
    const [filtedMessages, setFiltedMessages] = useImmer<ChatMessage[]>([])

    const [userIdSelect, setUserIdSelect] = useImmer<number>(-1)

    const [typeSelect, setTypeSelect] = useImmer<TypeSelect>('none')

    const handleTypeChange = (value: TypeSelect) => {
        setTypeSelect(value)
        console.log(`Selected ${value}`)
    }

    const handleUserChange = (value: number) => {
        setUserIdSelect(value)
    }

    const filtMessage = (message: ChatMessage) => {
        let condition1: boolean = true
        switch (typeSelect) {
            case 'image':
                condition1 = message.type === ChatMessageType.Image
                break
            case 'file':
                condition1 = message.type === ChatMessageType.File
                break
            case 'audio':
                condition1 = message.type === ChatMessageType.Voice
                break
            case 'none':
                break
        }
        let condition2 = true
        if (userIdSelect !== -1) {
            condition2 = message.senderId === userIdSelect
        }
        return condition1 && condition2
    }

    return (
        <Modal
            footer={[]}
            onCancel={action(() => {
                setFiltedMessages([])
                modalStore.handleCancel()
            })}
            title={title}
            open={modalStore.isOpen}>
            <Space wrap>
                <Select
                    style={{ width: 120 }}
                    onChange={handleTypeChange}
                    defaultValue={'none'}
                    options={[
                        { value: 'none', label: '全部' },
                        { value: 'file', label: '文件' },
                        { value: 'image', label: '图片' },
                        { value: 'audio', label: '语音' },
                    ]}
                />
                {modalStore.showSelectSender && (
                    <Select
                        style={{ width: 120 }}
                        onChange={handleUserChange}
                        defaultValue={-1}
                        options={[{ value: -1, label: '全部' }, ...modalStore.selectUserOption]}
                    />
                )}
            </Space>
            <button
                className="ant-btn css-dev-only-do-not-override-1mqg3i0 ant-btn-default"
                onClick={action(() => {
                    const messages = modalStore.selectMessageList
                        ? modalStore.selectMessageList
                        : []
                    const filtedMessages = messages.filter(filtMessage)
                    setFiltedMessages(filtedMessages)
                })}>
                筛选
            </button>
            <button
                className="ant-btn css-dev-only-do-not-override-1mqg3i0 ant-btn-default"
                onClick={action(() => {
                    const firstIndex = modalStore.selectMessageList![0].inChatId!
                    const count = 20
                    if (firstIndex === 1) {
                        message.info('已经到头了哦~~~')
                        return
                    }
                    modalStore.selectMessageChat?.getMessages(firstIndex - 1, 20).then(() => {
                        modalStore.selectMessageList = modalStore.selectMessageChat?.messagesList()
                        if (typeSelect !== 'none' || userIdSelect !== -1) {
                            const messages = modalStore.selectMessageList
                                ? modalStore.selectMessageList
                                : []
                            const filtedMessages = messages.filter(filtMessage)
                            setFiltedMessages(filtedMessages)
                        }
                    })
                })}>
                拉取更多
            </button>
            {modalStore.selectMessageList && (
                <>
                    <p>
                        {`共${modalStore.selectMessageList.length}条消息 ` +
                            `查询范围: ${new Date(
                                modalStore.selectMessageList[0].timestamp
                            ).toLocaleString()} - ${new Date(
                                modalStore.selectMessageList[
                                    modalStore.selectMessageList.length - 1
                                ].timestamp
                            ).toLocaleString()}`}
                    </p>
                </>
            )}
            <h5>筛选结果</h5>
            <p>{`共${filtedMessages.length}条消息`}</p>
            <MessageBox msgs={filtedMessages} userId={authStore.userId} />
        </Modal>
    )
})

export const RegisterModal = observer(() => {
    useEffect(() => {
        let $box: any = document.querySelector('.ant-modal-root')
        let $this: any = document.querySelector('.choose-skin li.active')
        $box?.parentNode.classList.add('theme-' + $this.getAttribute('data-theme'))
    })
    switch (modalStore.modalType) {
        case 'AddFriend':
            return <AddFriendModalView title="添加好友" />
        case 'CreateGroup':
            return <CreateGroupModalView title="创建群聊" />
        case 'ChangePassword':
            return <ChangePasswordModalView title="设置新密码" />
        case 'RemoveSecure':
            return <RemoveSecureModalView title="取消聊天密码" />
        case 'SetSecure':
            return <SetSecureModalView title="设置聊天密码" />
        case 'TransferChat':
            return <TransferChatModalView title="选择要转发到的群聊" />
        case 'TransferChatBox':
            return <TransferChatBoxModalView title="聊天记录" />
        case 'JoinGroup':
            return <JoinGroupModalView title="申请加入群聊" />
        case 'ChangeGroupName':
            return <ChangeGroupNameModalView title="更改群聊名称" />
        case 'GroupMessageReaders':
            return <GroupMessageReadersModalView title="已读成员" />
        case 'GetUserIds':
            return <GetUserIdModalView title="查找用户" />
        case 'SendGroupNotice':
            return <SendGroupNoticeModalView title="发送群公告" />
        case 'LogOff':
            return <LogOffModalView title="注销账号" />
        case 'ReplyText':
            return <ReplyMessageModalView title="回复消息" />
        case 'SelectMessages':
            return <SelectMessageModalView title="筛选消息" />
        default:
            return <></>
    }
})
