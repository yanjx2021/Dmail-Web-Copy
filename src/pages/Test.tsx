import React, { useState } from 'react'
import { LoginData, Receive, Send } from '../utils/message'
import MessageServer from '../utils/network'

// 此文件仅用于测试路由切换是否成功
function Test() {
    const ms = new MessageServer("ws://127.0.0.1:8080/ws")
    const [text, setText] = useState("初始化")
    ms.connect()
    const usd: LoginData = {
        userId: 123,
        password: "fuck",
    }
    ms.received$.subscribe((data) => {
        console.log(data)
    })
    return (
        <div>
            <button onClick={() => {
                ms.send<Send.LOGIN>(Send.LOGIN, usd)
            }}>Send</button>
            <div>
                {}
            </div>
        </div>
    )
}

export default Test
