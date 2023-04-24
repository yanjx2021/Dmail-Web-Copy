import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'
import { Chat, ChatType } from '../../stores/chatStore'
import { createGroupFromAllFriendsSelectStore, userSelectStore } from '../MessagesBox/Selector'
import { chatSideStore } from '../../stores/chatSideStore'

export const DropDownItem = ({ text, handleClick }: { text: string; handleClick: any }) => {
    return (
        <a className="dropdown-item" type="button" onClick={handleClick}>
            {text}
        </a>
    )
}

export const ChatDropDown = observer(({ chat }: { chat: Chat }) => {
    return (
        <div className="dropdown">
            <a
                className="text-muted ms-1 p-2 text-muted"
                href="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={action(() => (secureAuthStore.chatId = chat.chatId))}>
                <i className="zmdi zmdi-more-vert"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
                {chat.chatType === ChatType.Private ? (
                    <>
                        {!createGroupFromAllFriendsSelectStore.showSelector ? (
                            <DropDownItem
                                text="多选以创建群聊"
                                handleClick={action(
                                    () => {
                                        userSelectStore.reset()
                                        if (chatSideStore.open && chatSideStore.type === 'user') {
                                            chatSideStore.UserSidebartoggle()
                                        }
                                        createGroupFromAllFriendsSelectStore.showSelector = true
                                    }
                                )}
                            />
                        ) : (
                            <DropDownItem
                                text="取消多选"
                                handleClick={action(
                                    () =>
                                        (createGroupFromAllFriendsSelectStore.showSelector = false)
                                )}
                            />
                        )}
                    </>
                ) : (
                    <></>
                )}
                <DropDownItem
                    text="设置二次验证"
                    handleClick={action(() => {
                        modalStore.modalType = 'SetSecure'
                        modalStore.isOpen = true
                    })}
                />
                {secureAuthStore.hasSetChatCode(chat.chatId) ? (
                    <DropDownItem
                        text="取消二次验证"
                        handleClick={action(() => {
                            modalStore.modalType = 'RemoveSecure'
                            modalStore.isOpen = true
                        })}
                    />
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
})
