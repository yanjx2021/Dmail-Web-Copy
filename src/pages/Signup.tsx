import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/style.min.css'
import '../styles/material-design-iconic-font.min.css'

interface StateType {
    user: string,
    password: string,
    cpassword: string,
}



// 校验两次输入的密码是否相同
function passVerification(password1: string, password2: string): boolean {
    return password1 === password2
}

class Signup extends React.Component<any, StateType> {
    constructor(props: any) {
        super(props)
        this.state = {
            user: "",
            password: "",
            cpassword: "",
        }
    }

    // TODO 关于向后端发送注册请求部分
    handleSubmit = (e: any) => {
        e.preventDefault()
        // TODO
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
                                                placeholder="请输入账号"
                                                value={this.state.user}
                                                onChange={(e) => {
                                                    this.setState({user: e.target.value})
                                                }}
                                            />
                                        </div>
                                        <div className="input-group mb-2">
                                            <input
                                                type="email"
                                                className="form-control form-control-lg"
                                                placeholder="请输入邮箱" />
                                        </div>
                                        <div className="input-group mb-2">
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                placeholder="请输入密码"
                                                value={this.state.password}
                                                onChange={(e) => {
                                                    this.setState({password: e.target.value})
                                                }}
                                            />
                                        </div>
                                        <div className="input-group mb-4">
                                            <input
                                                type="password"
                                                className="form-control form-control-lg"
                                                placeholder="请再次输入密码"
                                                value={this.state.cpassword}
                                                onChange={(e) => {
                                                    this.setState({cpassword: e.target.value})
                                                }}
                                            />
                                        </div>
                                        <div className="text-center mt-5">
                                            <button className="btn btn-lg btn-primary" title="">
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


export default Signup
