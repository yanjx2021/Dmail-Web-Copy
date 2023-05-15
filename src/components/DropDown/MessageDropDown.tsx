import { observer } from 'mobx-react-lite'
import { secureAuthStore } from '../../stores/secureAuthStore'
import { action } from 'mobx'
import { modalStore } from '../../stores/modalStore'
import { DropDownItem } from './ChatDropDown'
import { ChatMessage, ChatMessageType, ChatType, chatStore } from '../../stores/chatStore'
import { messageSelectStore } from '../MessagesBox/Selector'
import { authStore } from '../../stores/authStore'
import { externalStore } from '../../stores/externalStore'
import { binaryStore } from '../../stores/binaryStore'
import { blobToBase64, urlToBlob } from '../../utils/file'

export const MessageDropDown = observer(
    ({ msg, indexInView }: { msg: ChatMessage; indexInView: number }) => {
        // TODO-在这里添加删除消息的函数
        return (
            <div className="dropdown">
                <a
                    className="text-muted ms-1 p-2 text-muted"
                    href="#"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                    <i className="zmdi zmdi-more-vert"></i>
                </a>

                <div className="dropdown-menu dropdown-menu-right">
                    {msg.showReplyButton && (
                        <DropDownItem
                            text="回复"
                            handleClick={action(() => {
                                modalStore.modalType = 'ReplyText'
                                modalStore.isOpen = true
                                modalStore.replyMessageId = msg.inChatId
                            })}
                        />
                    )}
                    {messageSelectStore.showSelector ? (
                        <DropDownItem
                            text="取消多选"
                            handleClick={action(() => {
                                messageSelectStore.reset()
                                modalStore.isOpen = true
                            })}
                        />
                    ) : (
                        <DropDownItem
                            text="多选"
                            handleClick={action(() => {
                                messageSelectStore.showSelector = true
                                messageSelectStore.toggleCheckMessage(msg)
                            })}
                        />
                    )}

                    {msg.showRevokeButton && (
                        <DropDownItem text="撤回" handleClick={() => msg.revokeMessage()} />
                    )}

                    {msg.showGetReadersButton && msg.inChatId && (
                        <DropDownItem
                            text="查询已读成员"
                            handleClick={() => {
                                msg.getGroupReaders()
                                modalStore.modalType = 'GroupMessageReaders'
                                modalStore.isOpen = true
                            }}
                        />
                    )}

                    {msg.inChatId && msg.type === ChatMessageType.Text && (
                        <DropDownItem
                            text="翻译至中文"
                            handleClick={action(() => {
                                externalStore.translateByBaidu(msg, msg.content as string, 'zh')
                            })}
                        />
                    )}

                    {msg.inChatId && msg.type === ChatMessageType.Voice && (
                        <DropDownItem
                            text="转换至文字"
                            handleClick={action(() => {
                                const cachedUrl = binaryStore.getBinaryUrl(msg.content as string)
                                blobToBase64(cachedUrl.url).then((base64: any) =>
                                    externalStore.audioTranslateByBaidu(
                                        msg,
                                        base64.split(',')[1],
                                        cachedUrl.size
                                    )
                                )
                            })}
                        />
                    )}

                    <DropDownItem
                        text="删除"
                        handleClick={() => {
                            msg.deleteLocal(indexInView)
                        }}
                    />
                </div>
            </div>
        )
    }
)
