import { action } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useImmer } from 'use-immer'
import { secureAuthStore } from '../stores/secureAuthStore'

export const LockedChatView = () => {
    const [code, setCode] = useImmer<string>('')

    return (
        <div className="main px-xl-5 px-lg-4 px-3">
            <div className="chat-body">
                <div className="chat d-flex justify-content-center align-items-center h-100 text-center py-xl-4 py-md-3 py-2">
                    <div className="container-xxl">
                        <div className="avatar lg avatar-bg me-auto ms-auto mb-5">
                            <img
                                className="avatar lg rounded-circle border"
                                src="assets/images/lock.png"
                                alt=""
                            />
                            <span className="a-bg-1"></span>
                            <span className="a-bg-2"></span>
                        </div>
                        <h5 className="font-weight-bold">请输入聊天密码</h5>
                        <div>
                            <div>
                                <input
                                    className="form-control"
                                    type="password"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-dark"
                                onClick={action(() => {
                                    secureAuthStore.verifyChat(code)
                                    setCode('')
                                })}>
                                解锁
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
