import { action, observe } from 'mobx'
import {
    Request,
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
import { chatStore } from '../stores/chatStore'

const RequestItemStatus = observer(
    ({ senderId, state, reqId }: { senderId: number; state: RequestState; reqId: number }) => {
        const isSender = senderId === authStore.userId
        switch (state) {
            case RequestState.Unsolved:
                return isSender ? (
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

const RequestFriendItem = observer(({ request }: { request: Request }) => {
    //TODO-yjx
    //添加好友申请标题的样式,这个玩意：<h5>好友申请</h5>
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    <h5>好友申请</h5>
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>
                                    {request.isSender && 'receiverId' in request.content
                                        ? request.content.receiverId
                                        : request.senderId}
                                </span>
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

const RequestGroupItem = observer(({ request }: { request: Request }) => {
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    <h5>群聊申请</h5>
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>
                                    {request.isSender && 'chatId' in request.content
                                        ? request.content.chatId
                                        : request.senderId}
                                </span>
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

const RequestGroupInvitationItem = observer(({ request }: { request: Request }) => {
    const textTitle = `群聊 ${request.chat?.name} 的邀请`
    return (
        <li>
            <a className="card">
                <div className="card-body">
                    <h5>{textTitle}</h5>
                    <div className="media">
                        <div className="avatar me-3">
                            <span className="rounded-circle"></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>
                                    {request.isSender && 'receiverId' in request.content
                                        ? request.content.receiverId
                                        : request.senderId}
                                </span>
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

const RequestItem = observer(({ request }: { request: Request }) => {
    switch (request.content.type) {
        case RequestContentType.MakeFriend:
            return <RequestFriendItem request={request} />
        case RequestContentType.JoinGroup:
            return <RequestGroupItem request={request} />
        case RequestContentType.GroupInvitation:
            return <RequestGroupInvitationItem request={request} />
        default:
            return <div>Some Error</div>
    }
})

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
