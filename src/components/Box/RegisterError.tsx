import { action, autorun } from 'mobx'
import { useNavigate } from 'react-router-dom'
import { AuthState, authStore } from '../../stores/authStore'
import { requestStore } from '../../stores/requestStore'
import { updateUserStore } from '../../stores/updateUserStore'
import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { message } from 'antd'
import { useCallback, useEffect } from 'react'
import { duration } from '../../constants/messageContent'
import { messageSelectStore } from '../MessagesBox/Selector'

export const RegisterError = () => {
    useEffect(() => {
        // authStore
        const disposer = autorun(() => {
            if (authStore.errors !== '') {
                message.error({
                    content: authStore.errors,
                    duration: duration,
                    onClose: action(() => {
                        if (authStore.errors === '网络环境异常，请重新登录') {
                            authStore.logout()
                        }
                        authStore.errors = ''
                    }),
                })
            }
        })
        return disposer
    }, [])

    useEffect(() => {
        // requestStore
        const disposer = autorun(() => {
            if (requestStore.errors !== '') {
                message.error({
                    content: requestStore.errors,
                    duration: duration,
                    onClose: action(() => (requestStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])

    useEffect(() => {
        // updateUserStore
        const disposer = autorun(() => {
            if (updateUserStore.errors !== '') {
                message.error({
                    content: updateUserStore.errors,
                    duration: duration,
                    onClose: action(() => (updateUserStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])

    useEffect(() => {
        // secureAuthStore
        const disposer = autorun(() => {
            if (secureAuthStore.errors !== '') {
                message.error({
                    content: secureAuthStore.errors,
                    duration: duration,
                    onClose: action(() => (secureAuthStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])
    useEffect(() => {
        // messageSelectStore
        const disposer = autorun(() => {
            if (messageSelectStore.errors !== '') {
                message.error({
                    content: messageSelectStore.errors,
                    duration: duration,
                    onClose: action(() => (messageSelectStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])


    return <></>
}
