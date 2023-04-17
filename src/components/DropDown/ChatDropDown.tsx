import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'

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
                    data-toggle="modal"
                    data-target="#SetSecureCode">
                    设置二次验证
                </a>
                {secureAuthStore.hasSetChatCode(chatId) ? (
                    <a
                        className="dropdown-item"
                        type="button"
                        data-toggle="modal"
                        data-target="#RemoveSecureCode">
                        取消二次验证
                    </a>
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
})
