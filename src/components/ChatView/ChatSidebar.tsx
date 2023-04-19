import { observer } from 'mobx-react-lite'
import { Chat } from '../../stores/chatStore'

export const ChatSidebar = observer(
    ({ chat, sideHandler }: { chat: Chat; sideHandler: Function }) => {
        return (
            <div className="user-detail-sidebar py-xl-4 py-3 px-xl-4 px-3">
                <div className="d-flex flex-column">
                    <div className="header border-bottom pb-4 d-flex justify-content-between">
                        <div>
                            <h6 className="mb-0 font-weight-bold">用户信息</h6>
                            <span className="text-muted">Update your profile details</span>
                        </div>
                        <div>
                            <button
                                className="btn btn-link text-muted close-chat-sidebar"
                                type="button"
                                onClick={() => sideHandler('closechatsidebar')}>
                                <i className="zmdi zmdi-close"></i>
                            </button>
                        </div>
                    </div>
                    <div className="body mt-4">
                        <div className="d-flex justify-content-center">
                            <div className="avatar xxl">
                            <span className="status xxl rounded-circle"></span>
                                    <div
                                        // 添加颜色
                                        className={'avatar xxl rounded-circle no-image ' + 'timber'}>
                                        {/* TODO-昵称缩写 */}
                                        <span>{chat.chatId}</span>
                                    </div>
                            </div>
                        </div>
                        <div className="text-center mt-3 mb-5">
                            <h4>{chat.name}</h4>
                            <span className="text-muted">
                                <a
                                    href="/cdn-cgi/l/email-protection"
                                    className="__cf_email__"
                                    data-cfemail="f4999d979c91989891da938691919ab49399959d98da979b99">
                                    [email&#160;protected]
                                </a>
                            </span>
                            <p>+14 123 456 789 - New york (USA)</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
