import { observer } from "mobx-react-lite";
import { Chat, ChatId, ChatStore } from "../stores/chatStore";
import { action } from "mobx";

const RecentChatItem = observer((
    { chat, activeChatId, setActiveChatId }: { chat: Chat, activeChatId: ChatId | null, setActiveChatId: (chatId: ChatId) => any }
) => {
    return (
        <li className={activeChatId === chat.chatId ? 'online active' : ''}>
            <a className="card" onClick={action(() => setActiveChatId(chat.chatId))}>
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className='rounded-circle'></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>
                                    {chat.name.slice(0, Math.min(2, chat.name.length))}
                                </span>
                            </div>
                        </div>
                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">
                                    {chat.name}
                                </h6>
                                <p className="small text-muted text-nowrap ms-4 mb-0">
                                    {
                                        chat.lastMessage !== undefined ?
                                            new Date(chat.lastMessage.timestamp).toLocaleString() :
                                            <></>
                                    }
                                </p>
                            </div>
                            <div className="text-truncate">{chat.lastMessage !== undefined ? chat.lastMessage.text : ""}</div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    )
})

export const RecentChats = observer(({ chatStore, activeChatId, setActiveChatId}: { chatStore: ChatStore, activeChatId: ChatId | null, setActiveChatId: (chatId: ChatId) => any}) => {
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
                {chatStore.recentChatsView.map((chat) => <RecentChatItem chat={chat} activeChatId={activeChatId} setActiveChatId={setActiveChatId} key={chat.chatId}/>)}
            </ul>
        </div>
    )
})