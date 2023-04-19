import { observer } from 'mobx-react-lite'
import { AuthMethod, AuthState, AuthStore, authStore } from '../stores/authStore'
import { action, autorun } from 'mobx'
import { EmailCodeInput } from '../components/EmailCodeInput'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useMessage from 'antd/es/message/useMessage'
import { message } from 'antd'
import '../styles/Login.css'
import { duration } from '../constants/messageContent'

const EmailInput = observer(({ authStore }: { authStore: AuthStore }) => {
    return (
        <div className="input-group mb-2">
            <input
                type="email"
                className="form-control form-control-lg"
                placeholder="请输入邮箱"
                value={authStore.email}
                onChange={action((e) => {
                    authStore.email = e.target.value
                })}
            />
        </div>
    )
})

const LoginCodeForm = observer(({ authStore }: { authStore: AuthStore }) => {
    return (
        <div className="mb-4 mt-5">
            <EmailInput authStore={authStore} />
            <EmailCodeInput
                email={authStore.email}
                emailCode={authStore.emailCode}
                setEmailCode={action((code) => {
                    authStore.emailCode = code
                })}
                setErrors={action((error) => {
                    authStore.errors = error
                })}
            />
        </div>
    )
})

const LoginPasswordForm = observer(({ authStore }: { authStore: AuthStore }) => {
    return (
        <div className="mb-4 mt-5">
            <EmailInput authStore={authStore} />
            <div className="input-group mb-4">
                <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="请输入密码"
                    value={authStore.password}
                    onChange={action((e) => {
                        authStore.password = e.target.value
                    })}
                />
            </div>
        </div>
    )
})

const LoginCard = observer(({ authStore }: { authStore: AuthStore }) => {
    return (
        <div className="card-body">
            <h3 className="text-center">登录</h3>
            <p className="text-center mb-6">
                欢迎来到dMail!
                <button className="link" onClick={authStore.toggleLoginMethod}>
                    {authStore.method === AuthMethod.Email ? '密码登录?' : '验证码登录?'}
                </button>
            </p>
            <div className="mb-4 mt-5">
                {authStore.method === AuthMethod.Password ? (
                    <LoginPasswordForm authStore={authStore} />
                ) : (
                    <LoginCodeForm authStore={authStore} />
                )}

                <div className="form-group d-flex justify-content-between">
                    <label className="c_checkbox">
                        <input type="checkbox" />
                        <span className="ms-2 todo_name">记住我</span>
                        <span className="checkmark"></span>
                    </label>
                    <NavLink to="/" className="link">
                        重置密码
                    </NavLink>
                </div>

                <div className="text-center mt-5">
                    <button
                        disabled={authStore.state === AuthState.Logging}
                        className="btn btn-lg btn-primary"
                        onClick={authStore.login}>
                        {authStore.state === AuthState.Logging ? '正在登录...' : '登录'}
                    </button>
                </div>
            </div>
            <p className="text-center mb-0">
                还没有账户?
                <NavLink to="/signup" className="link">
                    注册
                </NavLink>
            </p>
        </div>
    )
})

export const LoginPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const disposer = autorun(() => {
            if (authStore.errors !== '') {
                message.error({
                    content: authStore.errors,
                    duration: duration,
                    onClose: action(() => (authStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])

    useEffect(() => {
        autorun(() => {
            if (authStore.state === AuthState.Logged) {
                navigate('/home')
            }
        })
    }, [navigate])
    return (
        <div id="layout" className="theme-cyan">
            <div className="authentication">
                <div className="container d-flex flex-column">
                    <div className="row align-items-center justify-content-center no-gutters min-vh-100">
                        <div className="col-12 col-md-7 col-lg-5 col-xl-4 py-md-11">
                            <div className="card border-0 shadow-sm">
                                <LoginCard authStore={authStore} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
