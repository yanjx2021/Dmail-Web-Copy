import { UserInfo } from "../utils/userListPage";


const UserItem = (props: {user: UserInfo, handleClick: Function, timestamp: number}) => {

    return (<li className="online active">
        <div className="card" onClick={props.handleClick(props.user.userId)}>
            <div className="card-body">
                <div className="media">
                    <div className="avatar me-3">
                        <div className="avatar rounded-circle no-image timber">
                            <span>{props.user.userName.slice(0, Math.min(2, props.user.userName.length))}</span>
                        </div>
                    </div>
                    <div className="media-body overflow-hidden">
                        <div className="d-flex align-items-center mb-1">
                            <h6 className="text-truncate mb-0 me-auto">{props.user.userName}</h6>
                            <p className="small text-muted text-nowrap ms-4 mb-0">{new Date(props.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-truncate">
                            TODO-最新的一条消息的节选
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </li>)
}

export default UserItem