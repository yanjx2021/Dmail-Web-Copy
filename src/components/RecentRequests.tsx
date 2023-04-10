import { action, observe } from 'mobx'
import {
    RequestContent,
    RequestContentType,
    RequestState,
    RequestStore,
    requestStore,
} from '../stores/requestStore'
import { observer } from 'mobx-react-lite'
import { useImmer } from 'use-immer'
import { useEffect } from 'react'
import { authStore } from '../stores/authStore'

const RequestItemStatus = observer(
    ({ senderId, state, reqId }: { senderId: number; state: RequestState; reqId: number }) => {
        switch (state) {
            case RequestState.Unsolved:
                return senderId === authStore.userId ? (
                    <div>等待对方验证...</div>
                ) : (
                    <div>
                        <div className="btn-friend d-flex">
                            <button
                                className="btn btn-success"
                                type="button"
                                onClick={action(() => requestStore.approveRequest(reqId))}>
                                同意
                            </button>
                        </div>
                        <div className="btn-friend d-flex">
                            <button
                                className="btn btn-danger"
                                type="button"
                                onClick={action(() => requestStore.refuseRequest(reqId))}>
                                拒绝
                            </button>
                        </div>
                    </div>
                )
                break
            case RequestState.Approved:
                return senderId === authStore.userId ? <div>请求已通过</div> : <div>已同意</div>
                break
            case RequestState.Refused:
                return senderId === authStore.userId ? <div>请求被拒绝</div> : <div>已拒绝</div>
        }
    }
)

const RequestFriendItem = ({
    message,
    reqId,
    senderId,
    receiverId,
    state,
}: {
    message: string
    reqId: number
    senderId: number
    receiverId: number
    state: RequestState
}) => {
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>{reqId}</span>
                            </div>
                        </div>
                        <div className="apply-media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">名字</h6>
                            </div>
                            <div className="text-truncate">{message}</div>
                        </div>
                        <RequestItemStatus senderId={senderId} state={state} reqId={reqId} />
                    </div>
                </div>
            </a>
        </li>
    )
}

const RequestGroupItem = ({
    message,
    reqId,
    senderId,
    chatId,
    state,
}: {
    message: string
    reqId: number
    senderId: number
    chatId: number
    state: RequestState
}) => {
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>{reqId}</span>
                            </div>
                        </div>
                        <div className="apply-media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">名字</h6>
                            </div>
                            <div className="text-truncate">{message}</div>
                        </div>
                        <RequestItemStatus senderId={senderId} state={state} reqId={reqId} />
                    </div>
                </div>
            </a>
        </li>
    )
}

const RequestItem = observer(
    ({
        message,
        reqId,
        senderId,
        content,
        state,
    }: {
        message: string
        reqId: number
        senderId: number
        content: RequestContent
        state: RequestState
    }) => {
        switch (content.type) {
            case RequestContentType.MakeFriend:
                return (
                    <RequestFriendItem
                        message={message}
                        state={state}
                        reqId={reqId}
                        senderId={senderId}
                        receiverId={content.receiverId}
                    />
                )
                break
            case RequestContentType.JoinGroup:
                return (
                    <RequestGroupItem
                        message={message}
                        state={state}
                        reqId={reqId}
                        senderId={senderId}
                        chatId={content.chatId}
                    />
                )
            default:
                return <div>Some Error</div>
        }
    }
)

const AddFriendBox = observer(() => {
    const [reqId, setReqId] = useImmer<string>('')
    return (
        <div className="modal fade" id="InviteFriends" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">添加好友</h5>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="form-group">
                                <label>用户ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={reqId}
                                    onChange={(e) => setReqId(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>验证消息</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={requestStore.message}
                                    onChange={action((e) => requestStore.message = e.target.value)}
                                />
                            </div>
                        </form>
                        <div className="mt-5">
                            <button
                                type="button"
                                className="btn btn-primaty"
                                onClick={() => requestStore.sendMakeFriendRequest(parseInt(reqId))}>
                                发送请求
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

const RecentRequests = observer(({ requestStore }: { requestStore: RequestStore }) => {
    return (
        <div className="tab-pane fade" id="nav-tab-newfriends" role="tabpanel">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 text-primary">请求列表</h3>
            </div>
            <div>
                <a
                    className="btn btn-primary"
                    type="button"
                    data-toggle="modal"
                    data-target="#InviteFriends">
                    添加好友
                </a>
            </div>
            <ul className="chat-list">
                {requestStore.requestsList.map(({ message, reqId, senderId, content, state }) => (
                    <RequestItem
                        key={reqId}
                        state={state}
                        message={message}
                        reqId={reqId}
                        senderId={senderId}
                        content={content}
                    />
                ))}
            </ul>
            <AddFriendBox />
        </div>
    )
})

export default RecentRequests
