
import { useImmer } from 'use-immer'
import '../../styles/RecentRequests.css'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'


export const CreateGroupChatBox = ({id} : {id : string}) => {
    const [groupName, setGroupName] = useImmer<string>('')
    return (
        <div className="modal fade" id={id} tabIndex={9999} aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">创建群聊</h5>
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
                                <label>群聊名称</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={groupName}
                                    onChange={(e) => {
                                        setGroupName(e.target.value)
                                    }}
                                />
                            </div>
                        </form>
                        <div className="mb-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    MessageServer.Instance().send<Send.CreateGroupChat>(Send.CreateGroupChat, {
                                        name: groupName,
                                        avaterPath: ''
                                    })
                                    setGroupName('')
                                }}>
                                创建群聊
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}