import { randomcolor } from './Randomcolor'

export interface TextInf {
    uori?: boolean
    hisname?: string
    text?: string
    time?: string
    color?: string
    serverid?:number
    senderId?: number,
    inChatId?: number,
    timeStamp?: number
}
const SingleMess = (props: TextInf) => {
    return props.uori ? (
        <li className="d-flex message right">
            <div className="message-body">
                <span className="date-time text-muted">{props.time} </span>
                <div className="message-row d-flex align-items-center justify-content-end">
                    <div className="dropdown">
                        <a
                            className="text-muted me-1 p-2 text-muted"
                            href="#"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <i className="zmdi zmdi-more-vert"></i>
                        </a>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#">
                                编辑
                            </a>
                            <a className="dropdown-item" href="#">
                                分享
                            </a>
                            <a className="dropdown-item" href="#">
                                删除
                            </a>
                        </div>
                    </div>
                    <div className="message-content border p-3">{props.text}</div>
                </div>
                <div className="message-row d-flex align-items-center justify-content-end"></div>
            </div>
        </li>
    ) : (
        <li className="d-flex message">
            <div className="avatar mr-lg-3 me-2">
                <div className={'avatar rounded-circle no-image ' + props.color}>
                    <span>{props.hisname?.slice(0, 2)}</span>
                </div>
            </div>
            <div className="message-body">
                <span className="date-time text-muted">
                    {props.hisname} , {props.time}
                </span>
                <div className="message-row d-flex align-items-center">
                    <div className="message-content p-3">{props.text}</div>
                    <div className="dropdown">
                        <a
                            className="text-muted ms-1 p-2 text-muted"
                            href="#"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false">
                            <i className="zmdi zmdi-more-vert"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                            <a className="dropdown-item" href="#">
                                编辑
                            </a>
                            <a className="dropdown-item" href="#">
                                分享
                            </a>
                            <a className="dropdown-item" href="#">
                                删除
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}
export default SingleMess
