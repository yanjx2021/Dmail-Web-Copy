import { observer } from 'mobx-react-lite'
import { ModalStore, modalStore } from '../../stores/modalStore'
import { Button, Modal } from 'antd'
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
            <form>
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
            </form>
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
                            avaterPath: '',
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
            <form>
                <ModalInput
                    type="text"
                    label="群聊名称"
                    value={groupName}
                    setValue={(e: any) => {
                        setGroupName(e.target.value)
                    }}
                />
            </form>
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
            <form>
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
            </form>
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
            <form>
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
            </form>
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
            <form>
                <ModalInput
                    type="password"
                    label="原密码"
                    value={code}
                    setValue={action((e: any) => {
                        setCode(e.target.value)
                    })}
                />
            </form>
        </Modal>
    )
})

export const RegisterModal = observer(() => {
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
        default:
            return <></>
    }
})
