import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'
import { Chat, ChatType } from '../../stores/chatStore'
import { createGroupFromAllFriendsSelectStore, userSelectStore } from '../MessagesBox/Selector'
import { chatSideStore } from '../../stores/chatSideStore'
import { DropDownItem } from './ChatDropDown'
import { User } from '../../stores/userStore'
import { groupChatManageStore } from '../../stores/groupChatManageStore'

export const SidebarUserDropDown = ({ user, chatId }: { user: User; chatId: number }) => {
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
                <DropDownItem
                    text="设置管理员"
                    handleClick={action(() => {
                        groupChatManageStore.sendSetGroupAdmin(user.userId, chatId)
                    })}
                />
            </div>
        </div>
    )
}
