import React from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { messageServer } from '../utils/networkWs'
import { Receive, Send } from '../utils/message'
import withRouter from '../components/WithRouter'
import { SHA256 } from 'crypto-js'
import { emailTest, emailTester, strengthTest } from '../constants/passwordFormat'

interface StateType {
    email: string
    password: string
    cpassword: string
    emailCode: string
    userName: string
    disabled: boolean
    cooldown: number
    showPasswordTip: boolean
    showCpasswordTip: boolean
    showEmailTip: boolean
}

// 校验两次输入的密码是否相同
function passVerification(password1: string, password2: string): boolean {
    return password1 === password2
}

const passwordConsistencyTest = (password1: string, password2: string) => {
    if (passVerification(password1, password2)) {
        return <div style={{ color: 'green', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>密码相同</div>
    } else {
        return <div style={{ color: 'red', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>两次密码不一致</div>
    }
}

class Signup extends React.Component<any, StateType> {
    constructor(props: any) {
        super(props)
        this.state = {
            email: '',
            password: '',
            cpassword: '',
            emailCode: '',
            disabled: false,
            userName: '',
            cooldown: 60,
            showPasswordTip: false,
            showCpasswordTip: false,
            showEmailTip: false,
        }
        messageServer.on(Receive.RegisterResponse, (data: any) => {
            if (data.state === 'Success') {
                props.navigate('/login')
            } else {
                alert('注册失败' + data.state)
            }
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
    }

    render() {
        return (
            <div id="layout" className="theme-cyan">
                <div className="authentication">
                    <div className="container d-flex flex-column">
                        <div className="row align-items-center justify-content-center no-gutters min-vh-100">
                            <div className="col-12 col-md-7 col-lg-5 col-xl-4 py-md-11">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="text-center">注册</h3>
                                        <p className="text-center mb-6">欢迎使用dMail</p>
                                        <form className="mb-4 mt-5" onSubmit={this.handleSubmit}>
                                            <div className="input-group mb-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-lg"
                                                    placeholder="请输入用户名"
                                                    value={this.state.userName}
                                                    onChange={(e) => {
                                                        this.setState({ userName: e.target.value })
                                                    }}
                                                />
                                            </div>
                                            <div className="input-group mb-2">
                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    placeholder="请输入邮箱"
                                                    value={this.state.email}
                                                    onBlur={() => this.setState({...this.state, showEmailTip: true})}
                                                    onFocus={() => this.setState({...this.state, showEmailTip: false})}
                                                    onChange={(e) => {
                                                        this.setState({ email: e.target.value })
                                                    }}
                                                />
                                            </div>
                                            {this.state.showEmailTip ? emailTest(this.state.email) : <div></div>}
                                            <div className="input-group mb-2">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg"
                                                    placeholder="请输入验证码"
                                                    value={this.state.emailCode}
                                                    onChange={(e) => {
                                                        const emailCode = e.target.value.replace(/[^\d]/, '')
                                                        this.setState({ emailCode: emailCode })
                                                    }}
                                                />
                                                <button
                                                    className="btn btn-lg btn-primary"
                                                    disabled={this.state.disabled}
                                                    onClick={() => {
                                                        if (!emailTester.test(this.state.email)) {
                                                            return
                                                        }
                                                        axios.post('/api/email/code', {
                                                            email: this.state.email,
                                                        })
                                                        this.setState({
                                                            disabled: !this.state.disabled,
                                                        })
                                                        const timer = setInterval(() => {
                                                            this.setState({
                                                                cooldown: this.state.cooldown - 1,
                                                            })
                                                        }, 1000)
                                                        setTimeout(() => {
                                                            this.setState({
                                                                disabled: !this.state.disabled,
                                                            })
                                                            clearInterval(timer)
                                                            this.setState({ cooldown: 60 })
                                                        }, 60000)
                                                    }}>
                                                    {this.state.disabled === false
                                                        ? '发送验证码'
                                                        : this.state.cooldown + 's'}
                                                </button>
                                            </div>
                                            <div className="input-group mb-2">
                                                <input
                                                    type="password"
                                                    className="form-control form-control-lg"
                                                    placeholder="请输入密码"
                                                    value={this.state.password}
                                                    onFocus={() => {
                                                        this.setState({...this.state, showPasswordTip: true})
                                                    }}
                                                    onBlur={() => {
                                                        this.setState({...this.state, showPasswordTip: false})
                                                    }}
                                                    onChange={(e) => {
                                                        this.setState({ password: e.target.value })
                                                    }}
                                                />
                                            </div>
                                            {this.state.showPasswordTip ? strengthTest(this.state.password) : <div></div>}
                                            <div className="input-group mb-2">
                                                <input
                                                    type="password"
                                                    className="form-control form-control-lg"
                                                    placeholder="请再次输入密码"
                                                    value={this.state.cpassword}
                                                    onFocus={() => {
                                                        this.setState({...this.state, showCpasswordTip: true})
                                                    }}
                                                    onBlur={() => {
                                                        this.setState({...this.state, showCpasswordTip: false})
                                                    }}
                                                    onChange={(e) => {
                                                        this.setState({ cpassword: e.target.value })
                                                    }}
                                                />
                                            </div>
                                            {this.state.showCpasswordTip ? passwordConsistencyTest(this.state.password, this.state.cpassword) : <div></div>}
                                            <div className="text-center mt-5">
                                                <button
                                                    className="btn btn-lg btn-primary"
                                                    title=""
                                                    onClick={() => {
                                                        if (this.state.userName === '') {
                                                            alert('用户名不能为空')
                                                        } else if (this.state.email === '') {
                                                            alert('邮箱不能为空')
                                                        } else if (this.state.emailCode === '') {
                                                            alert('验证码不能为空')
                                                        } else if (this.state.password === '') {
                                                            alert('密码不能为空')
                                                        } else if (
                                                            passVerification(
                                                                this.state.password,
                                                                this.state.cpassword
                                                            )
                                                        ) {
                                                            const data = {
                                                                email: this.state.email,
                                                                password: SHA256(
                                                                    this.state.password
                                                                ).toString(),
                                                                emailCode: parseInt(
                                                                    this.state.emailCode
                                                                ),
                                                                userName: this.state.userName,
                                                            }
                                                            messageServer.getInstance().send<Send.Register>(
                                                                Send.Register,
                                                                data
                                                            )
                                                        } else {
                                                            alert('两次密码不一致')
                                                        }
                                                    }}>
                                                    注册
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Signup)
