import { observer } from 'mobx-react-lite'
import { action } from 'mobx'
import { Chat } from '../../stores/chatStore'
import { DropDownItem } from './ChatDropDown'
import { User } from '../../stores/userStore'
import { groupChatManageStore } from '../../stores/groupChatManageStore'
import { authStore } from '../../stores/authStore'

export const SidebarUserDropDown = observer(({ user, chat }: { user: User; chat: Chat }) => {
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
                {chat.ownerId && chat.ownerId === authStore.userId && !chat.isAdmin(user.userId) && (
                    <DropDownItem
                        text="设置管理员"
                        handleClick={action(() => {
                            groupChatManageStore.sendSetGroupAdmin(user.userId, chat.chatId)
                        })}
                    />
                )}
                {(chat.ownerId === authStore.userId ||
                    (chat.isAdmin(authStore.userId) && !chat.isAdmin(user.userId))) && (
                    <DropDownItem
                        text="踢出群聊"
                        handleClick={action(() =>
                            groupChatManageStore.sendRemoveGroupMember(user.userId, chat.chatId)
                        )}
                    />
                )}
                {chat.ownerId && chat.ownerId === authStore.userId && (
                    <DropDownItem
                        text="移交群主"
                        handleClick={action(() => {
                            groupChatManageStore.sendGroupOwnerTransfer(user.userId, chat.chatId)
                        })}
                    />
                )}
            </div>
        </div>
    )
})
