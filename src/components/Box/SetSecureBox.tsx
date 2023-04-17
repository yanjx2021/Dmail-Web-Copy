import { action } from 'mobx'
import { requestStore } from '../../stores/requestStore'
import { observer } from 'mobx-react-lite'
import { useImmer } from 'use-immer'

import '../../styles/RecentRequests.css'
import { userSettingStore } from '../../stores/userSettingStore'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { secondaryCodeHash } from '../../constants/passwordHash'

export const SetSecureBox = observer(({ id }: { id: string }) => {
    const [code, setCode] = useImmer<string>('')
    const [oldCode, setOldCode] = useImmer<string>('')

    return (
        <div className="modal fade" id={id} tabIndex={9999} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">设置聊天密码</h5>
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
                            {secureAuthStore.hasSetCode ? (
                                <div className="form-group">
                                    <label>原密码</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={oldCode}
                                        onChange={(e) => setOldCode(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                            <div className="form-group">
                                <label>{secureAuthStore.hasSetCode ? '新密码' : '设置密码'}</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </form>
                        <div className="mb-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={action(() => {
                                    if (secureAuthStore.hasSetCode) {
                                        if (userSettingStore.getSecondaryCode(secureAuthStore.chatId) !== secondaryCodeHash(oldCode)) {
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
                                })}>
                                设置
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
