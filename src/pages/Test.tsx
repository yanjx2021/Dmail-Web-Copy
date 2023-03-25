import React, { useEffect, useState } from 'react'
// import { cryptionRSA } from '../utils/cipher'
import { Send, SendLoginData, SendRegisterData } from '../utils/message'
import MessageServer, {messageServer} from '../utils/network'
import CryptionRSA, { cryptionRSA } from '../utils/cipher'
import Login from './Login'

// 此文件仅用于测试路由切换是否成功


interface StateType {
    login: SendLoginData
    register: SendRegisterData
}

class Test extends React.Component<any, StateType> {
    constructor(props: any) {
        super(props)
        this.state = {
            login: { userId: 0, password: '' },
            register: { userName: '', password: '', email: '' },
        }
        const sub = messageServer.received$.subscribe((data) => {
            console.log(data)
        })
        messageServer.ws.next({
            command: Send.SetConnectPubKey,
            data: cryptionRSA.publicKey
        })
        messageServer.addSubscription(sub)
    }
    componentWillUnmount(): void {
        messageServer.unSubscribe()
    }
    render(): React.ReactNode {
        console.log('render')
        return (
            <div>
                <div>
                    <label>userId</label>
                    <input
                        value={this.state.login.userId}
                        onChange={(e) => {
                            this.setState({
                                login: { ...this.state.login, userId: parseInt(e.target.value) },
                            })
                        }}></input>
                    <label>password</label>
                    <input
                        value={this.state.login.password}
                        onChange={(e) => {
                            this.setState({
                                login: { ...this.state.login, password: e.target.value },
                            })
                        }}></input>
                    <button
                        onClick={() => {
                            messageServer.send<Send.Login>(Send.Login, {
                                userId: this.state.login.userId,
                                password: this.state.login.password,
                            })
                        }}>
                        Send Login
                    </button>
                </div>
                <div>
                    <label>userName</label>
                    <input
                        value={this.state.register.userName}
                        onChange={(e) => {
                            this.setState({
                                register: { ...this.state.register, userName: e.target.value },
                            })
                        }}></input>
                    <label>password</label>
                    <input
                        value={this.state.register.password}
                        onChange={(e) => {
                            this.setState({
                                register: { ...this.state.register, password: e.target.value },
                            })
                        }}></input>
                    <label>email</label>
                    <input
                        value={this.state.register.email}
                        onChange={(e) => {
                            this.setState({
                                register: { ...this.state.register, email: e.target.value },
                            })
                        }}></input>
                    <button
                        onClick={() => {
                            messageServer.send<Send.Register>(Send.Register, this.state.register)
                        }}>
                        Send Register
                    </button>
                </div>
            </div>
        )
    }
}

export default Test
