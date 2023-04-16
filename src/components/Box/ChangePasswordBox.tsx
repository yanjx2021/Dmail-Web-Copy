import { action } from 'mobx'
import { requestStore } from '../../stores/requestStore'
import { observer } from 'mobx-react-lite'
import { useImmer } from 'use-immer'

import '../../styles/RecentRequests.css'
import { updateUserStore } from '../../stores/updateUserStore'
import { EmailCodeInput } from '../EmailCodeInput'
import { authStore } from '../../stores/authStore'

export const ChangePasswordBox = observer(({ id }: { id: string }) => {
    return (
        <div className="modal fade" id={id} tabIndex={9999} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">修改密码</h5>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>新的密码</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={updateUserStore.newPassword}
                                    onChange={action((e) => {
                                        updateUserStore.newPassword = e.target.value
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>验证消息</label>
                                <EmailCodeInput
                                    email={authStore.email}
                                    emailCode={updateUserStore.emailCode}
                                    setErrors={action((error) => (updateUserStore.errors = error))}
                                    setEmailCode={action(
                                        (data) => (updateUserStore.emailCode = data)
                                    )}
                                />
                            </div>
                        </form>
                        <div className="mb-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={action(() => {
                                    updateUserStore.updateType = 'Password'
                                    updateUserStore.sendUpdateUserInfo()
                                })}>
                                修改密码
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
