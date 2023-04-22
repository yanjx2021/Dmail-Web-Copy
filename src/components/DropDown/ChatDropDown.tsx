import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'

export const DropDownItem = ({ text, handleClick }: { text: string; handleClick: any }) => {
    return (
        <a className="dropdown-item" type="button" onClick={handleClick}>
            {text}
        </a>
    )
}

export const ChatDropDown = observer(({ chatId }: { chatId: number }) => {
    return (
        <div className="dropdown">
            <a
                className="text-muted ms-1 p-2 text-muted"
                href="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                onClick={action(() => (secureAuthStore.chatId = chatId))}>
                <i className="zmdi zmdi-more-vert"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
                <DropDownItem
                    text="设置二次验证"
                    handleClick={action(() => {
                        modalStore.modalType = 'SetSecure'
                        modalStore.isOpen = true
                    })}
                />
                {secureAuthStore.hasSetChatCode(chatId) ? (
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
