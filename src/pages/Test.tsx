import React from 'react'
// import { cryptionRSA } from '../utils/cipher'
import { Receive, Send, SendLoginData, SendRegisterData } from '../utils/message'
import { messageServer } from '../utils/networkWs'
import { myCrypto } from '../utils/cipher'
import axios from 'axios'

// 此文件仅用于测试路由切换是否成功

function testAES(data: any) {
    console.log('-----------------')
    const m = myCrypto.encryptAES(data)
    console.log(m)
    console.log(myCrypto.decryptAES(m))
    console.log('-----------------')
}

interface StateType {
    login: SendLoginData
    register: SendRegisterData
    other: {
        command: string,
        data: string,
        aes_password?: string | never
    }
}

class Test extends React.Component<any, StateType> {
    constructor(props: any) {
        console.log(props)
        super(props)
        this.state = {
            login: { email: '', password: '' },
            register: { userName: '', password: '', email: '', emailCode: 0 },
            other: { command: '', data: '', aes_password: '' },
        }
        
        messageServer.on(Receive.LoginResponse, (data: any) => {
            console.log(data)
        })
    }
    render(): React.ReactNode {
        return (
            <div>
                <div>
                    <label>email</label>
                    <input
                        value={this.state.login.email}
                        onChange={(e) => {
                            this.setState({
                                login: { ...this.state.login, email: e.target.value },
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
                            axios.post("/api/email/code", {email : "1005637045@qq.com"})
                            messageServer.send<Send.Login>(Send.Login, {
                                email: this.state.login.email,
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
                <div>
                    <label>command</label>
                    <input
                        value={this.state.other.command}
                        onChange={(e) => {
                            this.setState({
                                other: { ...this.state.other, command: e.target.value },
                            })
                        }}></input>
                    <label>data</label>
                    <input
                        value={this.state.other.data}
                        onChange={(e) => {
                            this.setState({
                                other: { ...this.state.other, data: e.target.value },
                            })
                        }}></input>
                    <label>aes_password</label>
                    <input
                        value={this.state.other.aes_password}
                        onChange={(e) => {
                            this.setState({
                                other: { ...this.state.other, aes_password: e.target.value },
                            })
                        }}></input>
                    <button
                        onClick={() => {
                            let content = {
                                command: this.state.other.command,
                                data: JSON.parse(this.state.other.data),
                            }
                            console.log(content)
                            let packAge = messageServer.cipher.encryptAES(content)
                            console.log(packAge)
                            // messageServer.ws.next(packAge)
                        }}>
                        Send All
                    </button>
                </div>
            </div>
        )
    }
}

export default Test
