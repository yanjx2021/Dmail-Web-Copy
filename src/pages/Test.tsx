import { useImmer } from 'use-immer'
import { requestStore } from '../stores/requestStore'
import { action, autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { authStore } from '../stores/authStore'
import RecentRequests from '../components/RecentRequests'

const Test = observer(() => {
    const [receiverId, setReceiverId] = useImmer('')
    const [approveId, setApproveId] = useImmer('')
    const [refuseId, setRefusedId] = useImmer('')
    useEffect(() => {
        autorun(() => {
            console.log('requests', requestStore.requests.size)
            console.log('requestsStash', requestStore.requsetStash.size)
        })
    }, [])

    return (
        <div>
            <p>{authStore.userId}</p>
            <div>
                <input
                    placeholder="好友id"
                    value={receiverId}
                    onChange={(e) => {
                        setReceiverId(e.target.value)
                    }}
                />
                <input
                    placeholder="消息"
                    value={requestStore.message}
                    onChange={action((e) => {
                        requestStore.message = e.target.value
                    })}
                />
                <button onClick={() => requestStore.sendMakeFriendRequest(parseInt(receiverId))}>
                    发送
                </button>
            </div>
            <div>
                <input
                    placeholder="同意的Id"
                    value={approveId}
                    onChange={(e) => {
                        setApproveId(e.target.value)
                    }}
                />
                <button onClick={action(() => requestStore.approveRequest(parseInt(approveId)))}>
                    同意
                </button>
            </div>
            <input
                placeholder="拒绝的Id"
                value={refuseId}
                onChange={(e) => {
                    setRefusedId(e.target.value)
                }}
            />
            <button
                onClick={action(() => {
                    requestStore.refuseRequest(parseInt(refuseId))
                })}>
                拒绝
            </button>
            <div>
                <RecentRequests requestStore={requestStore} />
            </div>
        </div>
    )
})
export default Test
