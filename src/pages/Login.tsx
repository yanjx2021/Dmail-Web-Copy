import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { messageServer } from '../utils/networkWs'
import { LoginResponseState, Receive, ReceiveLoginResponseData, Send } from '../utils/message'
import withRouter from '../components/WithRouter'
import axios from 'axios'
import { SHA256 } from 'crypto-js'
import { passwordTester } from '../constants/passwordFormat'
import { emailTest } from '../constants/passwordFormat'


interface StateType {
    email: string
    password: string
    type: boolean
    disabled: boolean
    emailCode: string
    cooldown: number
    showEmailTip: boolean
}

export let hasLogged = false

class Login extends React.Component<any, StateType> {
    loginResponse?: ReceiveLoginResponseData
    timer: any = 0
    constructor(props: any) {
        super(props)
        this.state = {
            email: '',
            password: '',
            type: false,
            disabled: false,
            emailCode: '',
            cooldown: 60,
            showEmailTip: false,
        }
        messageServer.on(Receive.LoginResponse, (data: any) => {
            if (data.state !== LoginResponseState.Success) {
                switch (data.state) {
                    case LoginResponseState.PasswordError:
                        alert('密码错误，请重新输入')
                        this.setState({ ...this.state, password: '' })
                        break
                    case LoginResponseState.UserNotFound:
                        alert('用户不存在')
                        this.setState({ ...this.state, email: '', password: '' })
                        break
                    case LoginResponseState.UserLogged:
                        alert('该用户已在其他地方登录')
                        this.setState({
                            email: '',
                            password: '',
                            type: false,
                            disabled: false,
                            emailCode: '',
                            cooldown: 60,
                        })
                        break
                    default:
                        alert('请重新登录')
                }
            } else {
                hasLogged = true
                props.navigate('/home')
            }
        })
    }

    componentDidMount(): void {
        document.addEventListener('keydown', this.onKeyDown)
    }
    componentWillUnmount(): void {
        document.removeEventListener('keydown', this.onKeyDown)
    }
    onKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            if (this.state.type) {
                this.handleEmailLogin()
            } else {
                this.handlePasswordLogin()
            }
        }
    }

    handleEmailLogin = () => {
        messageServer.send<Send.Login>(Send.Login, {
            email: this.state.email,
            emailCode: parseInt(this.state.emailCode),
        })
    }
    handlePasswordLogin = () => {
        if (!passwordTester.test(this.state.password)) {
            alert('密码格式错误: 请输入长度为8-20, 包含数字和字母的密码')
            this.setState({...this.state, password: ''})
        } else {
            messageServer.send<Send.Login>(Send.Login, {
                email: this.state.email,
                password: SHA256(this.state.password).toString()
            })
        }
    }
    render(): React.ReactNode {
        return (
            <div id="layout" className="theme-cyan">
                <div className="authentication">
                    <div className="container d-flex flex-column">
                        <div className="row align-items-center justify-content-center no-gutters min-vh-100">
                            <div className="col-12 col-md-7 col-lg-5 col-xl-4 py-md-11">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h3 className="text-center">登录</h3>
                                        <p className="text-center mb-6">
                                            欢迎来到dMail!
                                            <a
                                                className="link"
                                                onClick={() => {
                                                    this.setState({
                                                        type: !this.state.type,
                                                        password: '',
                                                        emailCode: '',
                                                    })
                                                }}>
                                                {' '}
                                                {this.state.type ? '密码登录?' : '验证码登录?'}
                                            </a>
                                        </p>
                                        {this.state.type ? (
                                            <div className="mb-4 mt-5">
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
                                                <div className="input-group mb-4">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        placeholder="请输入验证码"
                                                        value={this.state.emailCode}
                                                        onChange={(e) => {
                                                            this.setState({
                                                                emailCode: e.target.value,
                                                            })
                                                        }}
                                                    />
                                                    <button
                                                        className="btn btn-lg btn-primary"
                                                        disabled={this.state.disabled}
                                                        onClick={() => {
                                                            axios.post('/api/email/code', {
                                                                email: this.state.email,
                                                            })
                                                            this.setState({
                                                                disabled: !this.state.disabled,
                                                            })
                                                            const timer = setInterval(() => {
                                                                this.setState({
                                                                    cooldown:
                                                                        this.state.cooldown - 1,
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
                                                <div className="form-group d-flex justify-content-between">
                                                    <label className="c_checkbox">
                                                        <input type="checkbox" />
                                                        <span className="ms-2 todo_name">
                                                            记住我
                                                        </span>
                                                        <span className="checkmark"></span>
                                                    </label>
                                                </div>
                                                <div className="text-center mt-5">
                                                    <button
                                                        className="btn btn-lg btn-primary"
                                                        onClick={() => {
                                                            this.handleEmailLogin()
                                                        }}
                                                        onKeyDown={this.onKeyDown}>
                                                        登录
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 mt-5">
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
                                                <div className="input-group mb-4">
                                                    <input
                                                        type="password"
                                                        className="form-control form-control-lg"
                                                        placeholder="请输入密码"
                                                        value={this.state.password}
                                                        onChange={(e) => {
                                                            this.setState({
                                                                password: e.target.value,
                                                            })
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group d-flex justify-content-between">
                                                    <label className="c_checkbox">
                                                        <input type="checkbox" />
                                                        <span className="ms-2 todo_name">
                                                            记住我
                                                        </span>
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <NavLink to="/test" className="link">
                                                        重置密码
                                                    </NavLink>
                                                </div>
                                                <div className="text-center mt-5">
                                                    <button
                                                        className="btn btn-lg btn-primary"
                                                        onClick={() => {
                                                            this.handlePasswordLogin()
                                                        }}
                                                        onKeyDown={this.onKeyDown}>
                                                        登录
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-center mb-0">
                                            还没有账户?
                                            <NavLink to="/signup" className="link">
                                                注册
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

export default withRouter(Login)
