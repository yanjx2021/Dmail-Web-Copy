export const AllChatList = (props: {}) => {
    return (
        <>
            <div className="tab-pane fade" id="nav-tab-contact" role="tabpanel">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 text-primary">通讯录</h3>
                    <div>
                        <button
                            className="btn btn-primary"
                            type="button"
                            data-toggle="modal"
                            data-target="#InviteFriends">
                            邀请好友
                        </button>
                    </div>
                </div>

                <div className="form-group input-group-lg search mb-3">
                    <i className="zmdi zmdi-search"></i>
                    <input type="text" className="form-control" placeholder="搜索..." />
                </div>
                <ul className="chat-list">
                    <li>
                        <a href="#" className="card">
                            <div className="card-body">
                                <div className="media">
                                    <div className="avatar me-3">
                                        <div className="avatar rounded-circle no-image bg-warning text-light">
                                            <span>
                                                <i className="zmdi zmdi-account-add"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="media-body overflow-hidden d-flex">
                                        <h6 className="d-flex align-items-center mb-1">新的好友</h6>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </li>
                    <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
                        <span>TODO-下面是通讯录</span>
                    </li>
                </ul>
            </div>
            <div className="modal fade" id="InviteFriends" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">邀请好友</h5>
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
                                    <label>邮箱地址</label>
                                    <input type="email" className="form-control" />
                                    <small id="emailHelp" className="form-text text-muted">
                                        您的邮箱不会被用于任何的商业用途
                                    </small>
                                </div>
                            </form>
                            <div className="mt-5">
                                <button type="button" className="btn btn-primary">
                                    发送请求
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}