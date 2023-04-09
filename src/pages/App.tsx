import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, } from './Login'
import { SignupPage } from './Signup'
import Test from './Test'

// 该组件用于切换路由，当然现在只是naive的测试版本
// class App extends React.Component {
//     render() {
//         return (
//             <main>
//             <Routes>
//                 <Route path="/" element={<Navigate to={'/login'} />} />
//             <Route path='*' element={<Navigate to={'/login'} />} />
//             </Routes>
//             </main>
//         )
//     } 
// }

class App extends React.Component {
    render() {
        return (
            <main>
            <Routes>
                <Route path="/" element={<Navigate to={'/login'} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path='/test' element={<Test />} />
                <Route path='*' element={<Navigate to={'/login'} />} />
            </Routes>
            </main>
        )
    } 
}

export default App
