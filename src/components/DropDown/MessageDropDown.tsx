import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'
import { DropDownItem } from './ChatDropDown'
import { ChatMessage } from '../../stores/chatStore'

export const MessageDropDown = ({
    msg,
    indexInView,
}: {
    msg: ChatMessage
    indexInView: number
}) => {
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
