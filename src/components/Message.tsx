import { TextInf } from './Singlemess'
interface MessageInf {
    user: string
    chatid?:number
    lastime?: string
    userstate?: string
    inf?: string
    boolcall?: boolean
    color?: string
}
export const iniMessageInf: MessageInf = {
    user: '',
    lastime: '',
    userstate: '',
    inf: '',
    boolcall: false,
    color: 'cyan',
}
export interface MessageInfPlus {
    messagebox: MessageInf
    multipletext?: TextInf[]
}
export const iniMessageInfPlus: MessageInfPlus = {
    messagebox: iniMessageInf,
    multipletext: [],
}
const Message = (props: MessageInf) => {
    return (
        <li className={props.userstate}>
            <div className="hover_action">
                <button type="button" className="btn btn-link text-info">
                    <i className="zmdi zmdi-eye"></i>
                </button>
                <button type="button" className="btn btn-link text-warning">
                    <i className="zmdi zmdi-star"></i>
                </button>
                <button type="button" className="btn btn-link text-danger">
                    <i className="zmdi zmdi-delete"></i>
                </button>
            </div>
            <a href="#" className="card">
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="status rounded-circle"></span>
                            <div className={'avatar rounded-circle no-image ' + props.color}>
                                <span>{props.user.slice(0, 2)}</span>
                            </div>
                        </div>
                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">{props.user}</h6>
                                <p className="small text-muted text-nowrap ms-4 mb-0">
                                    {props.lastime}
                                </p>
                            </div>
                            <div className="text-truncate">
                                {props.boolcall ? (
                                    <i className="zmdi zmdi-phone-missed me-1"></i>
                                ) : null}
                                {props.inf}
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    )
}
export default Message
