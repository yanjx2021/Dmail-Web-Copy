import { action } from 'mobx'
import {
    Request,
    RequestState,
    requestStore,
} from '../stores/requestStore'
import { observer } from 'mobx-react-lite'
import { authStore } from '../stores/authStore'
import '../styles/RecentRequests.css'
import { modalStore } from '../stores/modalStore'

const RequestItemStatus = observer(
    ({ senderId, state, reqId }: { senderId: number; state: RequestState; reqId: number }) => {
        const isSender = senderId === authStore.userId
        switch (state) {
            case RequestState.Unsolved:
                return isSender ? (
                    <div className="align-center-container">等待验证...</div>
                ) : (
                    <div className="align-center-container">
                        <button
                            className="btn btn-success"
                            type="button"
                            onClick={action(() => requestStore.approveRequest(reqId))}>
                            同意
                        </button>
                        <button
                            className="btn btn-danger"
                            type="button"
                            onClick={action(() => requestStore.refuseRequest(reqId))}>
                            拒绝
                        </button>
                    </div>
                )
                break
            case RequestState.Approved:
                return isSender ? (
                    <div className="align-center-container">请求已通过</div>
                ) : (
                    <div className="align-center-container">已同意</div>
                )
                break
            case RequestState.Refused:
                return isSender ? (
                    <div className="align-center-container">请求被拒绝</div>
                ) : (
                    <div className="align-center-container">已拒绝</div>
                )
        }
    }
)

const RequestItem = observer(({ request }: { request: Request }) => {
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    {/* TODO: yjx 这个Request的标题实在是太丑陋辣 */}
                    <h5>{request.title}</h5>
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <img className='avatar rounded-circle' src={request.getAvaterUrl} alt='avatar'/>
                            </div>
                        </div>
                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">{request.textTip}</h6>
                            </div>
                            <div className="text-truncate">{request.message}</div>
                        </div>
                        <RequestItemStatus
                            senderId={request.senderId}
                            state={request.state}
                            reqId={request.reqId}
                        />
                    </div>
                </div>
            </a>
        </li>
    )
})

const RecentRequests = observer(() => {
    return (
        <div className="tab-pane fade" id="nav-tab-newfriends" role="tabpanel">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">请求列表</h3>
                <div>
                    <a
                        className="btn btn-dark"
                        type="button"
                        onClick={action(() => {
                            modalStore.modalType = 'AddFriend'
                            modalStore.isOpen = true
                        })}>
                        <i className="zmdi zmdi-account-add" />
                        添加好友
                    </a>
                </div>
            </div>
            <div className="form-group input-group-lg search mb-3">
                <i className="zmdi zmdi-search"></i>
                <i className="zmdi zmdi-dialpad"></i>
                <input
                    className="form-control text-footerform"
                    type="text"
                    placeholder="搜索..."></input>
            </div>
            <ul className="chat-list">
                {requestStore.requestsList.map((req) => (
                    <RequestItem key={req.reqId} request={req} />
                ))}
            </ul>
        </div>
    )
})

export default RecentRequests
