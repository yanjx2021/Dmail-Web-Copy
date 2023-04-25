import { action } from "mobx"
import { chatSideStore } from "../../stores/chatSideStore"

export const ChatSidebarHeader = ({
    title,
    chatId,
}: {
    title: string
    chatId: number
}) => {
    return (
        <div className="header border-bottom pb-4 d-flex justify-content-between">
            <div>
                <h6 className="mb-0 font-weight-bold">{title}</h6>
                <span className="text-muted">{'聊天ID: ' + chatId}</span>
            </div>
            <div>
                <button
                    className="btn btn-link text-muted close-chat-sidebar"
                    type="button"
                    onClick={action(() => chatSideStore.close())}>
                    <i className="zmdi zmdi-close"></i>
                </button>
            </div>
        </div>
    )
}
