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
import '../styles/RecentRequests.css'
import { userStore } from '../stores/userStore'
import { MessageServer } from '../utils/networkWs'
import { Send } from '../utils/message'
import { modalStore } from '../stores/modalStore'

const RequestItemStatus = observer(
    ({ senderId, state, reqId }: { senderId: number; state: RequestState; reqId: number }) => {
        switch (state) {
            case RequestState.Unsolved:
                return senderId === authStore.userId ? (
                    <div className="align-center-container">等待对方验证...</div>
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
                return senderId === authStore.userId ? (
                    <div className="align-center-container">请求已通过</div>
                ) : (
                    <div className="align-center-container">已同意</div>
                )
                break
            case RequestState.Refused:
                return senderId === authStore.userId ? (
                    <div className="align-center-container">请求被拒绝</div>
                ) : (
                    <div className="align-center-container">已拒绝</div>
                )
        }
    }
)

const RequestFriendItem = observer(
    ({
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
                                    <span>
                                        {senderId === authStore.userId ? receiverId : senderId}
                                    </span>
                                </div>
                            </div>
                            <div className="media-body overflow-hidden">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="text-truncate mb-0 me-auto">
                                        {senderId === authStore.userId
                                            ? userStore.getUser(receiverId).showName
                                            : userStore.getUser(senderId).showName}
                                    </h6>
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
)
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
                        <div className="media-body overflow-hidden">
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
        const userName = userStore.getUser(senderId).showName
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

const RecentRequests = observer(({ requestStore }: { requestStore: RequestStore }) => {
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
                <input className="form-control text-footerform" type="text" placeholder="搜索..."></input>
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
        </div>
    )
})

export default RecentRequests
