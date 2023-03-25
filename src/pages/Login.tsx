import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/style.min.css'
import '../styles/material-design-iconic-font.min.css'


interface StateType {
    user: string,
    password: string,

}

class Login extends React.Component<any, StateType> {

    constructor(props: any) {
        super(props)
        this.state = {
            user: "",
            password: "",
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
                                    <p className="text-center mb-6">欢迎来到dMail</p>
                                    <form className="mb-4 mt-5">
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
                                        <div className="input-group mb-4">
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
                                        <div className="form-group d-flex justify-content-between">
                                            <label className="c_checkbox">
                                                <input type="checkbox" />
                                                <span className="ms-2 todo_name">记住我</span>
                                                <span className="checkmark"></span>
                                            </label>
                                            <NavLink to="/password-reset" className="link">
                                                重置密码
                                            </NavLink>
                                        </div>
                                        <div className="text-center mt-5">
                                            <NavLink
                                                to="/"
                                                className="btn btn-lg btn-primary"
                                                title="">
                                                登录
                                            </NavLink>
                                        </div>
                                    </form>
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

export default Login
