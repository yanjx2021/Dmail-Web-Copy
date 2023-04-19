import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'

export const ChatDropDown = observer(({ chatId }: { chatId: number }) => {
    return (
        <div className="dropdown">
            <a
                className="text-muted ms-1 p-2 text-muted"
                href="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={action(() => secureAuthStore.chatId = chatId)}>
                <i className="zmdi zmdi-more-vert"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
                <a
                    className="dropdown-item"
                    type="button"
                    onClick={action(() => {
                        modalStore.modalType = 'SetSecure'
                        modalStore.isOpen = true
                    })}>
                    设置二次验证
                </a>
                {secureAuthStore.hasSetChatCode(chatId) ? (
                    <a
                        className="dropdown-item"
                        type="button"
                        onClick={action(() => {
                            modalStore.modalType = 'RemoveSecure'
                            modalStore.isOpen = true
                        })}>
                        取消二次验证
                    </a>
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
})
