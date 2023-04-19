import { observer } from 'mobx-react-lite'
import { Chat } from '../../stores/chatStore'

export const ChatViewHeader = observer(
    ({ chat,sideHandler }: { chat: Chat,sideHandler:Function }) => {
        return (
            <div className="chat-header border-bottom py-xl-4 py-md-3 py-2">
                <div className="container-xxl">
                    <div className="row align-items-center">
                        <div className="col-6 col-xl-4">
                            <div className="media">
                                <div className="avatar me-3 show-user-detail"
                                onClick={()=>sideHandler("openchatsidebar")}>
                                    <span className="status rounded-circle"></span>
                                    <div
                                        // 添加颜色
                                        className={'avatar rounded-circle no-image ' + 'timber'}>
                                        {/* TODO-昵称缩写 */}
                                        <span>{chat.chatId}</span>
                                    </div>
                                </div>
                                <div className="media-body overflow-hidden">
                                    <div className="d-flex align-items-center mb-1">
                                        {/* TODO-昵称缩写 */}
                                        <h6 className="text-truncate mb-0 me-auto">{chat.name}</h6>
                                    </div>
                                    {/* TODO-登录状态 */}
                                    <div className="text-truncate"></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-6 col-xl-8 text-end">
                            <ul className="nav justify-content-end">
                                <li className="nav-item list-inline-item d-none d-md-block me-3">
                                    <a
                                        href="#"
                                        className="nav-link text-muted px-3"
                                        data-toggle="collapse"
                                        data-target="#chat-search-div"
                                        aria-expanded="true"
                                        title="搜索">
                                        <i className="zmdi zmdi-search zmdi-hc-lg"></i>
                                    </a>
                                </li>
                                <li className="nav-item list-inline-item d-none d-sm-block me-3">
                                    <a
                                        href="#"
                                        className="nav-link text-muted px-3"
                                        title="视频通话">
                                        <i className="zmdi zmdi-videocam zmdi-hc-lg"></i>
                                    </a>
                                </li>
                                <li className="nav-item list-inline-item d-none d-sm-block me-3">
                                    <a
                                        href="#"
                                        className="nav-link text-muted px-3"
                                        title="语音通话">
                                        <i className="zmdi zmdi-phone-forwarded zmdi-hc-lg"></i>
                                    </a>
                                </li>
                                <li className="nav-item list-inline-item add-user-btn" onClick={()=>sideHandler("openusersidebar")}>
                                    <a href="#" className="nav-link text-muted px-3" title="新成员">
                                        <i className="zmdi zmdi-accounts-add zmdi-hc-lg"></i>
                                    </a>
                                </li>

                                <li className="nav-item list-inline-item d-block d-sm-none px-3">
                                    <div className="dropdown">
                                        <a
                                            className="nav-link text-muted px-0"
                                            href="#"
                                            data-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i className="zmdi zmdi-more-vert zmdi-hc-lg"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a className="dropdown-item" href="#">
                                                搜索
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                发送图像
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                视频通话
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                语音通话
                                            </a>
                                            <a className="dropdown-item" href="#">
                                                新成员
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
