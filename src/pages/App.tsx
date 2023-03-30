import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Test from './Test'
import Home from './Home'
import Login from './Login'
import Signup from './Signup'

// 该组件用于切换路由，当然现在只是naive的测试版本
class App extends React.Component {
    constructor(props: any) {
        super(props)
    }
    render() {
        return (
            <main>
            <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/" element={<Navigate to={'/login'} />} />
                <Route path="/home" element={<Home />} /> {/*TODO 主页*/}
                <Route path="/login" element={<Login />} />
                <Route path="/password-reset" element={<Home />} /> {/*TODO 重置密码界面 */}
                <Route path="/signup" element={<Signup />} /> {/*TODO 注册界面 */}
            </Routes>
        </main>
        )
    } 
}

export default App
