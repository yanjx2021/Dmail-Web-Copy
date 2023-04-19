import { observer } from 'mobx-react-lite'
import { Chat } from '../../stores/chatStore'
import { action } from 'mobx';
import { chatSideStore } from '../../stores/chatSideStore';
//这里面直接内置通讯录就行

export const UserSidebar = observer(
    ({ chat }: { chat: Chat }) => {
        return (
            <div className="addnew-user-sidebar py-xl-4 py-3 px-xl-4 px-3">
                <div className="d-flex flex-column">
                    <div className="header border-bottom pb-4 d-flex justify-content-between">
                        <div>
                            <h6 className="mb-0 font-weight-bold">添加群成员</h6>
                            <span className="text-muted">{chat.chatId}</span>
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
                    <div className="body mt-4">
                        <div className="form-group input-group-lg search mb-3">
                            <i className="zmdi zmdi-search"></i>
                            <input type="text" className="form-control" placeholder="搜索..." />
                        </div>

                        <ul className="chat-list">
                            <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                                <span>T</span>
                            </li>
                            <li>
                                <div className="hover_action">
                                    <button type="button" className="btn btn-link text-info">
                                        <i className="zmdi zmdi-plus-circle"></i>
                                    </button>
                                </div>
                                <a href="#" className="card">
                                    <div className="card-body">
                                        <div className="media">
                                            <div className="avatar me-3">
                                                <span className="status rounded-circle"></span>
                                                <div
                                                    // 添加颜色
                                                    className={
                                                        'avatar rounded-circle no-image ' + 'timber'
                                                    }>
                                                    {/* TODO-昵称缩写 */}
                                                    <span>chatid</span>
                                                </div>
                                            </div>
                                            <div className="media-body overflow-hidden">
                                                <div className="d-flex align-items-center mb-1">
                                                    <h6 className="text-truncate mb-0 me-auto">
                                                        Tommy Green
                                                    </h6>
                                                </div>
                                                <div className="text-truncate">
                                                    last seen 6 hours ago
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
)
