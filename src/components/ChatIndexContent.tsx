import { useEffect, useState } from 'react'
import { ChatIndexList } from '../utils/chatIndexListPage'
import ChatIndexItem from './ChatIndexItem'
import MailList from './UserList'

const ChatIndexContent = (props: {
    chatIndexList: ChatIndexList
    handleClick: Function
    activeId: number
}) => {
    const [chats, setChats] = useState()
    useEffect(() => {
        const tempChats: any = []
        props.chatIndexList.forEach((chat, chatId) => {
            tempChats.push(
                <ChatIndexItem
                    chat={chat}
                    handleClick={props.handleClick}
                    timestamp={Date.parse(new Date().toString())}
                    active={props.activeId}
                    key={chatId}
                />
            )
        })
        setChats(tempChats)
    }, [props.chatIndexList, props.activeId])

    return (
        <div className="tab-pane fade show active" id="nav-tab-chat" role="tabpanel">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">聊天</h3>
            </div>
            <div className="form-group input-group-lg search mb-3">
                <i className="zmdi zmdi-search"></i>
                <i className="zmdi zmdi-dialpad"></i>
                <input className="form-control" type="text" placeholder="搜索..."></input>
            </div>
            <ul className="chat-list">
                <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                    <span>最近的对话</span>
                </li>
                {chats}
            </ul>
        </div>
    )
}

export default ChatIndexContent
