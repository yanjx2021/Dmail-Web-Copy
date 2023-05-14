import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthState, AuthStore, authStore } from '../stores/authStore'
import { observer } from 'mobx-react-lite'
import Menu from '../components/Menu'
import { ChatId, ChatStore, chatStore } from '../stores/chatStore'
import { TabContent } from '../components/TabContent'
import { NoneActiveChatBody } from '../components/NoneActiveChatBody'
import { ChatView } from '../components/ChatView/ChatView'
import { action, autorun, makeAutoObservable } from 'mobx'
import { LocalDatabase } from '../stores/localData'
import { RegisterError } from '../components/Box/RegisterError'
import { secureAuthStore } from '../stores/secureAuthStore'
import { LockedChatView } from '../components/LockedChatView'
import { RegisterModal } from '../components/Box/Modal'
import { FileTest } from '../components/FileTest'
import { RtcTest } from '../components/RtcTest'
import { Settings } from '../components/Settings/Settings'
import { MessageServer } from '../utils/networkWs'
import { Send } from '../utils/message'
import { tokenStore } from '../stores/tokenStore'
import { externalStore } from '../stores/externalStore'

class HomeStore {
    openSetting = false

    constructor() {
        makeAutoObservable(this)
    }
}

export const homeStore = new HomeStore()

const Home = observer(
    ({ authStore, chatStore }: { authStore: AuthStore; chatStore: ChatStore }) => {
        const [activeChatId, setActiveChatId] = useState<ChatId | null>(null)

        const navigate = useNavigate()

        const checkAndSetActivateChat = useCallback(
            action((chatId: number) => {
                secureAuthStore.chatId = chatId
                setActiveChatId(chatId)
            }),
            [setActiveChatId]
        )

        useEffect(
            action(() => {
                if (authStore.state !== AuthState.Logged) {
                    navigate('/login')
                }
            }),
            [authStore.state]
        )

        useEffect(() => {
            const disposer = autorun(() => {
                if (
                    authStore.token === undefined &&
                    authStore.state === AuthState.Logged &&
                    tokenStore.rememberMe
                ) {
                    MessageServer.Instance().send<Send.ApplyForToken>(Send.ApplyForToken)
                }
            })
            return disposer
        }, [])

        useEffect(
            action(() => {
                LocalDatabase.loadUserSetting()
                externalStore.load()
            }),
            []
        )

        useEffect(
            action(() => {
                chatStore.setActiveChatId = setActiveChatId
            }),
            [setActiveChatId]
        )

        return authStore.state === AuthState.Logged ? (
            <>
                <RegisterError />
                <RegisterModal />
                <Menu />
                <TabContent activeChatId={activeChatId} setActiveChatId={checkAndSetActivateChat} />
                {homeStore.openSetting ? (
                    <Settings />
                ) : activeChatId === null ? (
                    <NoneActiveChatBody />
                ) : secureAuthStore.showSecureBox ? (
                    <LockedChatView />
                ) : (
                    <ChatView chat={chatStore.getChat(activeChatId)} />
                )}
            </>
        ) : (
            <></>
        )
    }
)

export const HomePage = () => {
    return (
        <div id="layout" className="theme-cyan">
            <Home authStore={authStore} chatStore={chatStore} />
        </div>
    )
}
