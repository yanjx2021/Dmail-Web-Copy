import { useState } from 'react'
import { Send } from '../utils/message'
import { messageServer } from '../utils/networkWs'
import SingleMess, { TextInf } from './Singlemess'
interface ChatInf {
    user: string
    userstate?: string
    color?: string
    text?: TextInf[]
}
const LetChatbody = (props: ChatInf) => {
    const [textvalue, settextvalue] = useState<string>('')
    const handleChange = (event: any) => {
        settextvalue(event.target.value)
    }
    return (
        <>
            <div className="chat-header border-bottom py-xl-4 py-md-3 py-2">
                <div className="container-xxl">
                    <div className="row align-items-center">
                        <div className="col-6 col-xl-4">
                            <div className="media">
                                <div className="avatar me-3 show-user-detail">
                                    <span className="status rounded-circle"></span>
                                    <div
                                        className={'avatar rounded-circle no-image ' + props.color}>
                                        <span>{props.user.slice(0, 2)}</span>
                                    </div>
                                </div>
                                <div className="media-body overflow-hidden">
                                    <div className="d-flex align-items-center mb-1">
                                        <h6 className="text-truncate mb-0 me-auto">{props.user}</h6>
                                    </div>
                                    <div className="text-truncate">{props.userstate}</div>
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
                                <li className="nav-item list-inline-item add-user-btn">
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
            <div className="collapse" id="chat-search-div">
                <div className="container-xxl py-2">
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="查找聊天记录" />
                        <div className="input-group-append">
                            <span className="input-group-text text-muted">0 / 0</span>
                        </div>
                        <div className="input-group-append">
                            <button type="button" className="btn btn-secondary">
                                搜索
                            </button>
                            <> </>
                            <button
                                type="button"
                                className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false">
                                <span className="sr-only">高级搜索 </span>
                            </button>
                            <div className="dropdown-menu dropdown-menu-right shadow border-0">
                                <a className="dropdown-item" href="#">
                                    Action
                                </a>
                                <a className="dropdown-item" href="#">
                                    Another action
                                </a>
                                <a className="dropdown-item" href="#">
                                    Something else here
                                </a>
                                <div role="separator" className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">
                                    Separated link
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chat-content">
                <div className="container-xxl">
                    <ul className="list-unstyled py-4">
                        {props.text?.map((item) => (
                            <SingleMess
                                uori={item.uori}
                                hisname={String(item?.senderId??"")}
                                time={String(item?.timeStamp??"")}
                                text={item.text}
                                color={props.color}></SingleMess>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="chat-footer border-top py-xl-4 py-lg-2 py-2">
                <div className="container-xxl">
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group align-items-center">
                                <input
                                    type="text"
                                    className="form-control border-0 pl-0"
                                    placeholder="请输入您的消息..."
                                    id="textinputer"
                                    onChange={handleChange}
                                    value={textvalue}
                                />

                                <div className="input-group-append d-none d-sm-block">
                                    <span className="input-group-text border-0">
                                        <button
                                            className="btn btn-sm btn-link text-muted"
                                            data-toggle="tooltip"
                                            title="清空"
                                            type="button"
                                            onClick={() => settextvalue('')}>
                                            <i className="zmdi zmdi-refresh font-22"></i>
                                        </button>
                                    </span>
                                </div>
                                <div className="input-group-append">
                                    <span className="input-group-text border-0">
                                        <button
                                            className="btn btn-sm btn-link text-muted"
                                            data-toggle="tooltip"
                                            title="表情"
                                            type="button">
                                            <i className="zmdi zmdi-mood font-22"></i>
                                        </button>
                                    </span>
                                </div>
                                <div className="input-group-append">
                                    <span className="input-group-text border-0">
                                        <button
                                            className="btn btn-sm btn-link text-muted"
                                            data-toggle="tooltip"
                                            title="附件"
                                            type="button">
                                            <i className="zmdi zmdi-attachment font-22"></i>
                                        </button>
                                    </span>
                                </div>

                                <div className="input-group-append">
                                    <span className="input-group-text border-0 pr-0">
                                        <button type="submit" className="btn btn-primary" onClick={() => {
                                            messageServer.send<Send.SendMessage>(Send.SendMessage, {
                                                clientId: 0,
                                                chatId: 0,
                                                text: textvalue,
                                                timestamp: 100
                                            })
                                            props.text?.push({
                                                uori:true,
                                                text: textvalue,
                                                timeStamp:100,
                                            })
                                            settextvalue('')
                                        }}>
                                            <span className="d-none d-md-inline-block me-2">
                                                发送
                                            </span>
                                            <i className="zmdi zmdi-mail-send"></i>
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default LetChatbody
