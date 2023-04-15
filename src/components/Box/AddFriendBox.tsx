import { action } from 'mobx'
import { requestStore } from '../../stores/requestStore'
import { observer } from 'mobx-react-lite'
import { useImmer } from 'use-immer'

import '../../styles/RecentRequests.css'

export const AddFriendBox = observer(({ id }: { id: string }) => {
    const [reqId, setReqId] = useImmer<string>('')
    return (
        <div className="modal fade" id={id} tabIndex={9999} aria-hidden="true">
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
                                    onChange={(e) => {
                                        const input = e.target.value.replace(/[^0-9]/g, '')
                                        setReqId(input)
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label>验证消息</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={requestStore.message}
                                    onChange={action(
                                        (e) => (requestStore.message = e.target.value)
                                    )}
                                />
                            </div>
                        </form>
                        <div className="mb-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    requestStore.sendMakeFriendRequest(
                                        parseInt(reqId) ? parseInt(reqId) : null
                                    )
                                    setReqId('')
                                }}>
                                发送请求
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
