import { action, autorun } from 'mobx'
import { authStore } from '../../stores/authStore'
import { requestStore } from '../../stores/requestStore'
import { updateUserStore } from '../../stores/updateUserStore'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { message } from 'antd'
import { useEffect } from 'react'
import { duration } from '../../constants/messageContent'
import { messageSelectStore, userSelectStore } from '../MessagesBox/Selector'
import { chatStore } from '../../stores/chatStore'

export const RegisterError = () => {
    useEffect(() => {
        // authStore
        const disposer = autorun(() => {
            if (authStore.errors !== '') {
                message.error({
                    content: authStore.errors,
                    duration: duration,
                    onClose: action(() => {
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
    useEffect(() => {
        // userSelectStore
        const disposer = autorun(() => {
            if (userSelectStore.errors !== '') {
                message.error({
                    content: userSelectStore.errors,
                    duration: duration,
                    onClose: action(() => (userSelectStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])
    useEffect(() => {
        // chatStore
        const disposer = autorun(() => {
            if (chatStore.errors !== '') {
                message.error({
                    content: chatStore.errors,
                    duration: duration,
                    onClose: action(() => (chatStore.errors = '')),
                })
            }
        })
        return disposer
    }, [])

    return <></>
}
