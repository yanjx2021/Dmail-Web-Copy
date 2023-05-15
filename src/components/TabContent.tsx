import { ChatId } from "../stores/chatStore"
import { AllChatList } from "./AllChats"
import { RecentChats } from "./RecentChats"
import RecentRequests from "./RecentRequests"
import { UserProfile } from "./UserProfile"

export const TabContent = ({activeChatId, setActiveChatId}: { activeChatId: ChatId | null, setActiveChatId: (chatId: ChatId) => any}) => {
    return (
        <div className="sidebar border-end py-xl-4 py-3 px-xl-4 px-3">
            <div className="tab-content">
                <RecentChats activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                <RecentRequests />
                <AllChatList activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                <UserProfile />
            </div>
        </div>
    )
}