import { useEffect } from 'react'
import { useState } from 'react'
import { ChatInfo } from '../utils/chatIndexListPage'

const ChatIndexItem = (props: { chat: ChatInfo; handleClick: Function; timestamp: number;active:number}) => {
    return (
        <li className={props.active===props.chat.chatId ? 'online active' : ''}>
            <div className="hover_action">
            <button type="button" className="btn btn-link text-info">
                <i className="zmdi zmdi-eye"></i>
            </button>
            <button type="button" className="btn btn-link text-warning">
                <i className="zmdi zmdi-star"></i>
            </button>
            <button type="button" className="btn btn-link text-danger">
                <i className="zmdi zmdi-delete"></i>
            </button>
        </div>
            <a
                className="card"
                onClick={() => {
                    props.handleClick(props.chat.chatId)
                }}>
                <div className="card-body">
                    <div className="media">
                        <div className="avatar me-3">
                            <span className='rounded-circle'></span>
                            <div className="avatar rounded-circle no-image timber">
                                <span>
                                    {props.chat.chatName.slice(
                                        0,
                                        Math.min(2, props.chat.chatName.length)
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="media-body overflow-hidden">
                            <div className="d-flex align-items-center mb-1">
                                <h6 className="text-truncate mb-0 me-auto">
                                    {props.chat.chatName}
                                </h6>
                                <p className="small text-muted text-nowrap ms-4 mb-0">
                                    {new Date(props.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-truncate">{props.chat.lastMessage ? props.chat.lastMessage : ''}</div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    )
}

export default ChatIndexItem
