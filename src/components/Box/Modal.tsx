import { observer } from 'mobx-react-lite'
import { ModalStore, modalStore } from '../../stores/modalStore'
import { Button, Checkbox, Modal } from 'antd'
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
import { Chat, chatStore } from '../../stores/chatStore'
import { MessageBox } from '../MessagesBox/MessageBox'
import { useEffect } from 'react'
import '../../styles/Modal.css'
import { updateGroupStore } from '../../stores/updateGroupStore'

export const ModalInput = ({
    label,
    type,
    value,
    setValue,
}: {
    label: string
    type: 'text' | 'password'
    value: string
    setValue: any
}) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input type={type} className="form-control" value={value} onChange={setValue} />
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
            />
            <ModalInput
                type="text"
                label="验证消息"
                value={requestStore.message}
                setValue={action((e: any) => (requestStore.message = e.target.value))}
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
            />
            <ModalInput
                type="text"
                label="验证消息"
                value={requestStore.message}
                setValue={action((e: any) => (requestStore.message = e.target.value))}
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
    console.log('转发消息', modalStore.transferData)
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
            />
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
        default:
            return <></>
    }
})
