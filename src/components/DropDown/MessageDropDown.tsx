import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'
import { DropDownItem } from './ChatDropDown'
import { ChatMessage, chatStore } from '../../stores/chatStore'
import { messageSelectStore } from '../MessagesBox/Selector'
import { authStore } from '../../stores/authStore'

export const MessageDropDown = observer(
    ({ msg, indexInView }: { msg: ChatMessage; indexInView: number }) => {
        // TODO-在这里添加删除消息的函数
        return (
            <div className="dropdown">
                <a
                    className="text-muted ms-1 p-2 text-muted"
                    href="#"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                    <i className="zmdi zmdi-more-vert"></i>
                </a>

                <div className="dropdown-menu dropdown-menu-right">
                    {messageSelectStore.showSelector ? (
                        <DropDownItem
                            text="取消多选"
                            handleClick={action(() => {
                                messageSelectStore.reset()
                            })}
                        />
                    ) : (
                        <DropDownItem
                            text="多选"
                            handleClick={action(() => {
                                messageSelectStore.showSelector = true
                                messageSelectStore.toggleCheckMessage(msg)
                            })}
                        />
                    )}

                    {msg.showRevokeButton && (
                        <DropDownItem text="撤回" handleClick={() => msg.revokeMessage()} />
                    )}

                    {msg.showGetReadersButton && msg.inChatId && (
                        <DropDownItem
                            text="查询已读成员"
                            handleClick={() => {
                                msg.getGroupReaders()
                                modalStore.modalType = 'GroupMessageReaders'
                                modalStore.isOpen = true
                            }}
                        />
                    )}
                    <DropDownItem
                        text="删除"
                        handleClick={() => {
                            msg.deleteLocal(indexInView)
                        }}
                    />
                </div>
            </div>
        )
    }
)
