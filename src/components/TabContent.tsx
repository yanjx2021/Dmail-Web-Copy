import { action } from "mobx"
import { ChatId, chatStore } from "../stores/chatStore"
import { requestStore } from "../stores/requestStore"
import { AllChatList } from "./AllChats"
import { ErrorBox } from "./Box/ErrorBox"
import { RecentChats } from "./RecentChats"
import RecentRequests from "./RecentRequests"
import { UserProfile } from "./UserProfile"

export const TabContent = ({activeChatId, setActiveChatId}: { activeChatId: ChatId | null, setActiveChatId: (chatId: ChatId) => any}) => {
    return (
        <div className="sidebar border-end py-xl-4 py-3 px-xl-4 px-3">
            <div className="tab-content">
                <RecentChats chatStore={chatStore} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                <RecentRequests requestStore={requestStore}/>
                <AllChatList chatStore={chatStore} activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                <UserProfile />
            </div>
        </div>
    )
}