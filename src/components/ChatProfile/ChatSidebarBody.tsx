import { observer } from 'mobx-react-lite'
import { Chat, ChatType } from '../../stores/chatStore'
import { message, Button, Popconfirm } from 'antd'
import { MessageServer } from '../../utils/networkWs'
import { Send } from '../../utils/message'

const ChatSidebarAvatar = ({ chatId }: { chatId: number }) => {
    return (
        <div className="d-flex justify-content-center">
            <div className="avatar xxl">
                <span className="status xxl rounded-circle"></span>
                <div className={'avatar xxl rounded-circle no-image ' + 'timber'}>
                    <span>{chatId}</span>
                </div>
            </div>
        </div>
    )
}

const ChatSidebarName = ({ name, type }: { name: string; type: ChatType }) => {
    return (
        <div className="text-center mt-3 mb-5">
            <h4>{name}</h4>
            {type === ChatType.Private ? (
                <span className="text-muted">
                    <a
                        className="__cf_email__"
                        data-cfemail="f4999d979c91989891da938691919ab49399959d98da979b99">
                        [email&#160;protected]
                    </a>
                </span>
            ) : (
                <></>
            )}
        </div>
    )
}

export const RemoveFriendButton = ({ userId }: { userId: number }) => {
    return (
        <div className="text-center mt-3 mb-5">
            <Popconfirm
                title="你确定删除这个好友吗"
                okText="确定"
                cancelText="取消"
                onConfirm={() => {
                    MessageServer.Instance().send<Send.Unfriend>(Send.Unfriend, userId)
                }}>
                <Button>删除好友</Button>
            </Popconfirm>
        </div>
    )
}

export const ChatSidebarBody = observer(({ chat }: { chat: Chat }) => {
    // TODO-后续群聊和用户可以复用
    return (
        <div className="body mt-4">
            <ChatSidebarAvatar chatId={chat.chatType === ChatType.Private ? chat.bindUser!.userId : chat.chatId} />
            <ChatSidebarName name={chat.sidebarName} type={chat.chatType} />
            {chat.chatType === ChatType.Private ? (
                <RemoveFriendButton userId={chat.bindUser!.userId} />
            ) : (
                <></>
            )}
        </div>
    )
})
