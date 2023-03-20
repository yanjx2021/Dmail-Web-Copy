import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Test from './Test'
import Home from './Home'
import Login from './Login'

// 该组件用于切换路由，当然现在只是naive的测试版本
function App() {
    return (
        <main>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/" element={<Home />} /> {/*TODO 主页*/}
                <Route path="/login" element={<Login />} />
                <Route path="/password-reset" element={<Home />} /> {/*TODO 重置密码界面 */}
                <Route path="/signup" element={<Home />} /> {/*TODO 注册界面 */}
            </Routes>
        </main>
    )
}

export default App
