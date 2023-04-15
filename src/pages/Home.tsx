import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthState, AuthStore, authStore } from '../stores/authStore'
import { observer } from 'mobx-react-lite'
import Menu from '../components/Menu'
import { ChatId, ChatStore, chatStore } from '../stores/chatStore'
import { TabContent } from '../components/TabContent'
import { NoneActiveChatBody } from '../components/NoneActiveChatBody'
import { ChatView } from '../components/ChatView/ChatView'
import { action, autorun } from 'mobx'
import { requestStore } from '../stores/requestStore'
import { ErrorBox } from '../components/Box/ErrorBox'
import { MessageServer } from '../utils/networkWs'
import { LocalDatabase } from '../stores/localData'

const Home = observer(
    ({ authStore, chatStore }: { authStore: AuthStore; chatStore: ChatStore }) => {
        const [activeChatId, setActiveChatId] = useState<ChatId | null>(null)
        const navigate = useNavigate()

        useEffect(action(() => {
            if (authStore.state !== AuthState.Logged) {
                navigate('/login')
            }
        }), [authStore.state])

        useEffect(action(() => {
            LocalDatabase.loadUserSetting()
        }), [])

        return authStore.state === AuthState.Logged ? (
            <>
                {authStore.showError ? (
                    <ErrorBox
                        title="连接错误"
                        error={authStore.errors}
                        setError={action((error) => (authStore.errors = error))}
                        onError={action(() => {
                            console.log('error')
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
                <Menu />
                <TabContent activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                {activeChatId === null ? (
                    <NoneActiveChatBody />
                ) : (
                    <ChatView chat={chatStore.getChat(activeChatId)} />
                )}
            </>
        ) : <></>
    }
)

export const HomePage = () => {
    return (
        <div id="layout" className="theme-cyan">
            <Home authStore={authStore} chatStore={chatStore} />
        </div>
    )
}
