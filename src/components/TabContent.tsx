import ChatIndexContent from "./ChatIndexContent"
import { ChatIndexList } from "../utils/chatIndexListPage"
import UserList from "./UserList"

const TabContent = (props: {
    chatIndexList: ChatIndexList
    handleClick: Function
    activeId: number
}) => {
    return (
        <div className="sidebar border-end py-xl-4 py-3 px-xl-4 px-3">
            <div className="tab-content">
                <UserList />
                <ChatIndexContent chatIndexList={props.chatIndexList} handleClick={props.handleClick} activeId={props.activeId}/>
            </div>
        </div>
    )
}

export default TabContent