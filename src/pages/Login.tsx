import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/style.min.css'
import '../styles/material-design-iconic-font.min.css'
import { messageServer } from '../utils/networkWs'
import { Receive, ReceiveLoginResponseData, Send } from '../utils/message'
import withRouter from '../components/WithRouter'
import axios from 'axios'

interface StateType {
    email: string
    password: string
    type: boolean
    disabled: boolean
    emailCode: string
    cooldown: number
}

let hasLogged = false

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
            cooldown: 60
        }
        messageServer.on(Receive.LoginResponse, (data: any) => {
            if (data.state !== 'Success') {
                alert('登陆失败')
                props.navigate('/login')
            } else {
                hasLogged = true
                props.navigate('/home')
            }
        })
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
                                                    this.setState({ type: !this.state.type, password: '', emailCode: '' })
                                                }}>
                                                {' '}
                                                {this.state.type ? '密码登录?' : '验证码登录?'}
                                            </a>
                                        </p>
                                        {this.state.type ? (
                                            <div className="mb-4 mt-5">
                                                <div className="input-group mb-2">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        placeholder="请输入邮箱"
                                                        value={this.state.email}
                                                        onChange={(e) => {
                                                            this.setState({ email: e.target.value })
                                                        }}
                                                    />
                                                </div>
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
                                                            this.setState({disabled: !this.state.disabled})
                                                            const timer = setInterval(() => {
                                                                this.setState({cooldown: this.state.cooldown - 1})
                                                            }, 1000)
                                                            setTimeout(() => {
                                                                this.setState({disabled: !this.state.disabled})
                                                                clearInterval(timer)
                                                                this.setState({cooldown: 60})
                                                            }, 60000)
                                                        }}>
                                                        {this.state.disabled === false ? '发送验证码' : this.state.cooldown + 's'}
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
                                                            if (hasLogged) {
                                                                this.props.navigate('/home')
                                                            } else {
                                                                messageServer.send<Send.Login>(
                                                                    Send.Login,
                                                                    {
                                                                        email: this.state.email,
                                                                        emailCode: parseInt(this.state.emailCode),
                                                                    }
                                                                )
                                                            }
                                                        }}>
                                                        登录
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 mt-5">
                                                <div className="input-group mb-2">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        placeholder="请输入邮箱"
                                                        value={this.state.email}
                                                        onChange={(e) => {
                                                            this.setState({ email: e.target.value })
                                                        }}
                                                    />
                                                </div>
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
                                                    <NavLink to="/" className="link">
                                                        重置密码
                                                    </NavLink>
                                                </div>
                                                <div className="text-center mt-5">
                                                    <button
                                                        className="btn btn-lg btn-primary"
                                                        onClick={() => {
                                                            if (hasLogged) {
                                                                this.props.navigate('/home')
                                                            } else {
                                                                messageServer.send<Send.Login>(
                                                                    Send.Login,
                                                                    {
                                                                        email: this.state.email,
                                                                        password: this.state.password,
                                                                    }
                                                                )
                                                            }
                                                        }}>
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
