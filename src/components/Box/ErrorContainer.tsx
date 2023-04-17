import { action } from 'mobx'
import { useNavigate } from 'react-router-dom'
import { AuthState, authStore } from '../../stores/authStore'
import { requestStore } from '../../stores/requestStore'
import { ErrorBox } from './ErrorBox'
import { updateUserStore } from '../../stores/updateUserStore'
import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'

export const ErrorContainer = observer(() => {
    const navigate = useNavigate()
    return (
        <>
            {authStore.showError ? (
                <ErrorBox
                    title="连接错误"
                    error={authStore.errors}
                    setError={action((error) => (authStore.errors = error))}
                    onError={action(() => {
                        authStore.state = AuthState.Started
                        navigate('/login')
                    })}
                />
            ) : (
                <></>
            )}
            {requestStore.showError ? (
                <ErrorBox
                    title="请求失败"
                    error={requestStore.errors}
                    setError={action((error) => (requestStore.errors = error))}
                />
            ) : (
                <></>
            )}
            {updateUserStore.showError ? (
                <ErrorBox
                    title="更新用户信息失败"
                    error={updateUserStore.errors}
                    setError={action((error) => (updateUserStore.errors = error))}
                />
            ) : (
                <></>
            )}
            {secureAuthStore.showError ? (
                <ErrorBox
                    title="更新用户信息失败"
                    error={secureAuthStore.errors}
                    setError={action((error) => (secureAuthStore.errors = error))}
                />
            ) : (
                <></>
            )}
        </>
    )
})
