import { action, autorun, makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { EmailCodeInput } from '../components/EmailCodeInput'
import { MessageServer } from '../utils/networkWs'
import { Receive, ReceiveRegisterResponseData, RegisterResponseState, Send } from '../utils/message'
import { SHA256 } from 'crypto-js'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { emailTester, passwordTester } from '../constants/passwordFormat'
import { message } from 'antd'
import '../styles/Login.css'
import { requestStore } from '../stores/requestStore'
import { duration } from '../constants/messageContent'

export {}

enum RegisterState {
    Started,
    Signuping,
    Signuped,
}

class RegisterStore {
    state = RegisterState.Started
    userName: string = ''
    email: string = ''
    emailCode: string = ''
    password: string = ''
    confirmPassword: string = ''
    errors: string = ''
    timer: any
    timeout: number = 3000

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true })
        MessageServer.on(Receive.RegisterResponse, this.handleRegisterResponse)
    }
    private handleRegisterResponse(data: ReceiveRegisterResponseData) {
        this.state = RegisterState.Started
        this.errors = ''
        clearTimeout(this.timer)
        switch (data.state) {
            case RegisterResponseState.Success:
                this.state = RegisterState.Signuped
                break
            case RegisterResponseState.EmailRegistered:
                this.errors = '该邮箱已被注册'
                break
            case RegisterResponseState.UserNameFormatError:
                this.errors = '用户名称格式错误'
                break
            case RegisterResponseState.ServerError:
                this.errors = '服务器异常，请重试'
                break
            case RegisterResponseState.PasswordFormatError:
                this.errors = '密码格式错误'
                break
            case RegisterResponseState.EmailCodeError:
                this.errors = '验证码错误'
                break
            case RegisterResponseState.EmailInvalid:
                this.errors = '邮箱格式错误'
                break
        }
        MessageServer.destroyInstance()
    }
    verify(): boolean {
        if (this.password !== this.confirmPassword) {
            this.errors = '两次密码不一致'
            return false
        }
        return true
    }

    signup() {
        if (this.state === RegisterState.Signuping) {
            this.errors = '正在注册'
            return
        }
        if (!emailTester.test(this.email)) {
            this.errors = '邮箱格式错误'
            this.email = ''
            return
        }
        if (!passwordTester.test(this.password)) {
            this.errors = '密码格式错误: 请输入长度为8-20, 包含数字和字母的密码'
            this.password = ''
            this.confirmPassword = ''
            return
        }
        if (!this.verify()) {
            this.errors = '两次输入的密码不同，请重新输入'
            return
        }
        if (this.emailCode === '') {
            this.errors = '验证码不能为空'
            return
        }
        this.timer = setTimeout(
            action(() => {
                this.state = RegisterState.Started
                this.errors = '网络连接超时，请检查网络状况'
            }),
            this.timeout
        )
        MessageServer.Instance().send<Send.Register>(Send.Register, {
            userName: this.userName,
            email: this.email,
            emailCode: parseInt(this.emailCode),
            password: SHA256(this.password + 'dmail' + this.email).toString(),
        })
        this.state = RegisterState.Signuping
    }

    get showError(): boolean {
        return this.errors !== ''
    }
}

const registerStore = new RegisterStore()

const PasswordInput = observer(
    ({
        placeholder,
        registerStore,
        type,
    }: {
        placeholder: '请输入密码' | '请再次输入密码'
        registerStore: RegisterStore
        type: 'Password' | 'ConfirmPassword'
    }) => {
        return (
            <div className="input-group mb-2">
                <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder={placeholder}
                    value={
                        type === 'Password' ? registerStore.password : registerStore.confirmPassword
                    }
                    onChange={action((e) => {
                        if (type === 'Password') {
                            registerStore.password = e.target.value
                        } else {
                            registerStore.confirmPassword = e.target.value
                        }
                    })}
                />
            </div>
        )
    }
)

const EmailInput = observer(({ registerStore }: { registerStore: RegisterStore }) => {
    return (
        <div className="input-group mb-2">
            <input
                type="email"
                className="form-control form-control-lg"
                placeholder="请输入邮箱"
                value={registerStore.email}
                onChange={action((e) => {
                    registerStore.email = e.target.value
                })}
            />
        </div>
    )
})

const UserNameInput = observer(({ registerStore }: { registerStore: RegisterStore }) => {
    return (
        <div className="input-group mb-2">
            <input
                type="text"
                className="form-control form-control-lg"
                placeholder="请输入用户名"
                value={registerStore.userName}
                onChange={action((e) => {
                    registerStore.userName = e.target.value
                })}
            />
        </div>
    )
})

const SignupCard = observer(({ registerStore }: { registerStore: RegisterStore }) => {
    return (
        <div className="card-body">
            <h3 className="text-center">注册</h3>
            <p className="text-center mb-6">欢迎使用dMail</p>
            <form
                className="mb-4 mt-5"
                onSubmit={(e) => {
                    e.preventDefault()
                }}>
                <UserNameInput registerStore={registerStore} />
                <EmailInput registerStore={registerStore} />
                <EmailCodeInput
                    email={registerStore.email}
                    emailCode={registerStore.emailCode}
                    setEmailCode={action((code) => {
                        registerStore.emailCode = code
                    })}
                    setErrors={action((error) => {
                        registerStore.errors = error
                    })}
                />
                <PasswordInput
                    registerStore={registerStore}
                    placeholder="请输入密码"
                    type="Password"
                />
                <PasswordInput
                    registerStore={registerStore}
                    placeholder="请再次输入密码"
                    type="ConfirmPassword"
                />
                <div className="text-center mt-5">
                    <button onClick={registerStore.signup} className="btn btn-lg btn-primary">
                        {registerStore.state === RegisterState.Signuping ? '注册中...' : '注册'}
                    </button>
                </div>
            </form>
            <p className="text-center mb-0">
                已经拥有账户?
                <NavLink to="/login" className="link">
                    登录
                </NavLink>
            </p>
        </div>
    )
})

export const SignupPage = () => {
    const navigate = useNavigate()
    
    useEffect(() => {
        const disposer = autorun(() => {
            if (registerStore.errors !== '') {
                message.error({
                    content: registerStore.errors,
                    duration: duration,
                    onClose: action(() => (registerStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])

    useEffect(() => {
        autorun(() => {
            if (registerStore.state === RegisterState.Signuped) {
                navigate('/login')
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
                                <SignupCard registerStore={registerStore} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
