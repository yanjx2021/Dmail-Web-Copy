import React, { useEffect, useState } from 'react'
// import { cryptionRSA } from '../utils/cipher'
import { Receive, Send, SendLoginData, SendRegisterData } from '../utils/message'
import MessageServer, { messageServer } from '../utils/network'
import Login from './Login'
import { myCrypto } from '../utils/cipher'
import { Buffer } from 'buffer'
import { createSemanticDiagnosticsBuilderProgram } from 'typescript'

// 此文件仅用于测试路由切换是否成功

function testAES(data: any) {
    console.log('-----------------')
    const m = myCrypto.encryptRSA(data)
    console.log(m)
    console.log(myCrypto.decryptRSA(m))
    console.log('-----------------')
}

interface StateType {
    login: SendLoginData
    register: SendRegisterData
    other: any
}

class Test extends React.Component<any, StateType> {
    constructor(props: any) {
        super(props)
        this.state = {
            login: { email: '', password: '' },
            register: { userName: '', password: '', email: '' },
            other: { command: '', data: '', aes_password: '' },
        }
        // testAES({ command: 'SetKey', data: 'hahaha' })
        testAES('this is a string')
        // messageServer.ws.next({
        //     command: Send.SetConnectPubKey,
        //     data: myCrypto.pubKey.slice(31, -30).replace(/[\r\n]/g, '')
        // })
        // messageServer.send<Send.SetConnectionPubKey>(Send.SetConnectionPubKey, messageServer.cipher.sendKey)
        messageServer.addSubscription(messageServer.ws.subscribe((data) => {
            console.log('receive data')
            console.log(data)
        }))
    }
    componentWillUnmount(): void {
        messageServer.unSubscribe()
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
                            if (this.state.other.aes_password != "") {
                                let content = {
                                    command: this.state.other.command,
                                    data: this.state.other.data,
                                };
                                messageServer.cipher.secretKey = Buffer.from(this.state.other.aes_password, 'ascii').toString('base64')
                                let packAge = messageServer.cipher.encryptAES(content);
                                messageServer.ws.next(packAge)
                            } else {
                                let data = messageServer.cipher.encryptRSA(this.state.other.data)
                                messageServer.ws.next({
                                    command: this.state.other.command,
                                    data: this.state.other.data,
                                })
                            }
                            
                        }}>
                        Send Login
                    </button>
                </div>
            </div>
        )
    }
}

export default Test
