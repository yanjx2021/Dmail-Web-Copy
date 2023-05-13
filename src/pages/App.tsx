import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './Login'
import { SignupPage } from './Signup'
import { HomePage } from './Home'
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
const App = () => {
    useEffect(() => {
        window.onkeydown =
            window.onkeyup =
            window.onkeypress =
                (event) => {
                    if (event.key === 'F12') {
                        event.preventDefault()
                    }
                }

        window.oncontextmenu = (event) => {
            event.preventDefault()
        }
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
