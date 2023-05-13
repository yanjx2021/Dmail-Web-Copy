import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './Login'
import { SignupPage } from './Signup'
import { HomePage } from './Home'
import Test from './Test'


const App = () => {
    useEffect(() => {
        const timer = setInterval(function () {
            (function() {var a: number = Date.now(); debugger; return Date.now() - a > 100;}())
        }, 500)
        window.onkeydown =
            window.onkeyup =
            window.onkeypress =
                (event) => {
                    if (event.key === 'F12') {
                        event.preventDefault()
                    }
                    if (event.ctrlKey && event.altKey && event.shiftKey && event.key === 'F5') {
                        event.preventDefault()
                        clearInterval(timer)
                    }
                    if (event.ctrlKey && event.key === 's') {
                        event.preventDefault()
                    }
                }

        window.oncontextmenu = (event) => {
            event.preventDefault()
        }
        // 打开控制台的宽或高阈值
        // 每秒检查一次
    }, [])
    return (
        <main>
            <Routes>
                <Route path="/" element={<Navigate to={'/login'} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/test" element={<Test />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<Navigate to={'/login'} />} />
            </Routes>
        </main>
    )
}

// class App extends React.Component {
//     render() {
//         return (
//             <main>
//             <Routes>
//                 <Route path="/" element={<Navigate to={'/login'} />} />
//                 <Route path="/login" element={<LoginPage />} />
//                 <Route path="/signup" element={<SignupPage />} />
//                 <Route path='/test' element={<Test />} />
//                 <Route path="/home" element={<HomePage />} />
//                 <Route path='*' element={<Navigate to={'/login'} />} />
//             </Routes>
//             </main>
//         )
//     }
// }

export default App
