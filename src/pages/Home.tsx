import React, { useEffect, useState } from 'react'
import { Message, Chat, ChatList } from '../utils/messagePage'
import { messageServer } from '../utils/networkWs'
import { ChatMessage, Receive } from '../utils/message'
import ChatBody from '../components/ChatBody'
import { Send } from '../utils/message'
import { hasLogged } from './Login'
import { useNavigate } from 'react-router-dom'
import ChatIndexContent from '../components/ChatIndexContent'
import { ChatInfo, ChatIndexList } from '../utils/chatListPage'
import ConstChatbody from '../components/ConstChatBody'
import Menu from '../components/Menu'

const Home = () => {
    const [chatList, setChatList] = useState<ChatList>(new Map<number, Chat>())
    const [chatIndexList, setChatIndexList] = useState<ChatIndexList>(new Map<number, ChatInfo>())
    const [onActivateChat, setOnActivateChat] = useState<number>(-1) // -1表示尚未选择聊天
    const [firstMount, setFirstMount] = useState<boolean>(true)
    const navigate = useNavigate()

    const updateChatList = () => {
        const temp = new Map()
        chatList.forEach((value, key) => {
            temp.set(key, value)
        })
        setChatList(temp)
    }
    const updateChatIndexList = () => {
        const temp = new Map()
        chatIndexList.forEach((value, key) => {
            temp.set(key, value)
        })
        setChatIndexList(temp)
    }

    const activateChat = (chatId: number) => {
        if (!chatList.has(chatId)) {
            chatList.set(chatId, {
                chatId: chatId,
                chatName: chatIndexList.get(chatId)?.chatName,
                messages: [],
            })
            updateChatList()
            console.log(chatList)
            // TODO-拉取消息-START
            //TODO-END
        }
        setOnActivateChat(chatId)
    }

    const addMessage = (chatId: number, message: Message) => {
        if (!chatList.has(chatId)) {
            chatList.set(chatId, { chatId: chatId, messages: [] })
        }
        chatList.get(chatId)?.messages.push(message)
        updateChatList()
    }
    const addChat = (chatId: number, chatName: string) => {
        if (!chatIndexList.has(chatId)) {
            chatIndexList.set(chatId, { chatId: chatId, chatName: chatName })
        } else {
            console.log('修改用户信息')
            chatIndexList.set(chatId, { chatId: chatId, chatName: chatName })
        }
        updateChatIndexList()
    }

    const updateChat = (chatId: number, text: string, timestamp: number) => {
        addMessage(chatId, {
            isRight: true,
            text: text,
            timestamp: timestamp,
            inChatId: 0,
            senderId: -1,
        })
    }

    useEffect(() => {
        if (!hasLogged) {
            setTimeout(() => {
                navigate('/login')
            }, 1000)
        } else if (firstMount === true) {
            // 测试用户列表功能
            addChat(0, '测试1')
            addChat(1, '测试2')
            setTimeout(() => {
                addChat(2, '测试3')
            }, 3000)
            // messageServer.start(() => {
            //     messageServer.getInstance().send<Send.Ping>(Send.Ping)
            // })
            messageServer.on(Receive.PullResponse, (data: any) => {
                console.log(data)
            })
            messageServer.getInstance().send<Send.Pull>(Send.Pull, {
                lastChatId: 0,
                lastMessageId: 0,
                lastRequestId: 0,
            })
            setFirstMount(false)
        }
        messageServer.on(Receive.Message, (data: ChatMessage) => {
            addMessage(data.chatId, {
                isRight: false,
                text: data.text,
                timestamp: data.timestamp,
                inChatId: data.inChatId,
                senderId: data.senderId,
            })
        })
    })

    return hasLogged ? (
        <div id="layout" className="theme-cyan">
            <Menu></Menu>
            <ChatIndexContent
                chatIndexList={chatIndexList}
                handleClick={(chatId: number) => {
                    activateChat(chatId)
                }}
                activeId={onActivateChat}
            />
            {onActivateChat === -1 ? (
                <ConstChatbody />
            ) : (
                <ChatBody chat={chatList.get(onActivateChat) as Chat} updateChat={updateChat} />
            )}
        </div>
    ) : (
        <div>没有权限访问，请登录</div>
    )
}

export default Home

// import React, { useEffect, useState } from 'react'
// import ConstChatbody from '../components/Const_Chatbody'
// import LetChatbody from '../components/Let_Chatbody'
// import Message, { MessageInfPlus, iniMessageInfPlus } from '../components/Message'
// import { randomcolor } from '../components/Randomcolor'
// import { FriendInf } from '../components/Sort'
// import { messtest } from '../constants/messtest'
// import { sorttest } from '../constants/sorttest'
// import { pinyin } from 'pinyin-pro'
// import { messageServer, MessageServer } from '../utils/networkWs'
// import { Receive } from '../utils/message'
// //通信列表示例
//  let MesList: MessageInfPlus[] = [
//     {
//         messagebox: {
//             user: '测试聊天室',
//             lastime: '',
//             userstate: 'active',
//             inf: '捏麻麻滴，这软工写不了一点',
//             boolcall: false,
//         },
//         multipletext: [],
//     },
// ]

// //通讯录示例
// let SortList: MessageInfPlus[] = sorttest
// // TODO Home页面
// function Home() {
//     let currentfirstalpha: string = '#'
//     const [Inichat, setInichat] = useState<boolean>(false)
//     const [MessList, setMessList] = useState<MessageInfPlus[]>(MesList)
//     const [Messbody, setMessbody] = useState<MessageInfPlus>(iniMessageInfPlus) //消息窗
//     const [FriendList, setFriendList] = useState<MessageInfPlus[]>(SortList) //朋友列表

//     useEffect(() => {
//         messageServer.on(Receive.Message, (data: any) => {
//             MesList[data.chatId].multipletext?.push({
//                 senderId: data.senderId,
//                 inChatId: data.inChatId,
//                 text: data.text,
//                 timeStamp: data.timestap,
//             })
//             setMessList(MesList)
//         })
//         messageServer.on(Receive.SendMessageResponse, (data: any) => {
//             console.log(data)
//         })
//     })

//     const updatechatbody = (props: MessageInfPlus) => {
//         setInichat(true)
//         setMessbody(props)
//     }
//     function onlineCN(state: string) {
//         if (state === 'online') return '在线'
//         else if (state === 'away') return '离线'
//         else return ''
//     }
//     //通讯录排序
//     const sortData = FriendList.sort(function (a, b) {
//         return pinyin(a.messagebox.user, { toneType: 'none' }).localeCompare(
//             pinyin(b.messagebox.user, { toneType: 'none' })
//         )
//     })
//     const alphatitle = (name: string) => {
//         let firstnamealp = pinyin(name, {
//             pattern: 'first',
//             toneType: 'none',
//         }).slice(0, 1)
//         var isnum = /^[A-Za-z]/
//         if (firstnamealp.toUpperCase() !== currentfirstalpha && isnum.test(firstnamealp)) {
//             currentfirstalpha = firstnamealp.toUpperCase()
//             return true
//         } else return false
//     }
//     const txltime = (ttime: string | undefined) => {
//         if (ttime === undefined) return ''
//         else return '上次聊天时间是 ' + ttime
//     }
//     return (
//         <div id="layout" className="theme-cyan">
//             <div className="navigation navbar justify-content-center py-xl-4 py-md-3 py-0 px-3">
//                 <a href="/home" title="dMail" className="brand">
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46" fill="none">
//                         <g id="logo-icon-color">
//                             <path
//                                 id="Vector"
//                                 d="M26.4966 6.01307V2.00436L22.9746 0L19.5029 2.00436V6.01307L22.9746 8.01743L26.4966 6.01307Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_2"
//                                 d="M34.7989 10.8235V6.81477L31.3272 4.81042L27.8555 6.81477V10.8235L31.3272 12.8279L34.7989 10.8235Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_3"
//                                 d="M43 15.4837V11.4749L39.5283 9.47058L36.0063 11.4749V15.4837L39.5283 17.488L43 15.4837Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_4"
//                                 d="M43 25.0043V20.9956L39.5283 18.9913L36.0063 20.9956V25.0043L39.5283 27.0087L43 25.0043Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_5"
//                                 d="M33.9935 19.9935V16.9368L31.3269 15.4336L28.6602 16.9368V19.9935L31.3269 21.5469L33.9935 19.9935Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_6"
//                                 d="M33.9935 29.5142V26.4575L31.3269 24.9041L28.6602 26.4575V29.5142L31.3269 31.0174L33.9935 29.5142Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_7"
//                                 d="M15.931 19.6928V17.2876L13.8178 16.085L11.7549 17.2876V19.6928L13.8178 20.8453L15.931 19.6928Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_8"
//                                 d="M15.931 29.1634V26.7582L13.8178 25.5555L11.7549 26.7582V29.1634L13.8178 30.366L15.931 29.1634Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_9"
//                                 d="M6.4717 24.0022V21.9978L4.76101 20.9956L3 21.9978V24.0022L4.76101 25.0044L6.4717 24.0022Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_10"
//                                 d="M43 34.4749V30.4662L39.5283 28.4619L36.0063 30.4662V34.4749L39.5283 36.4793L43 34.4749Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_11"
//                                 d="M25.9433 15.1329V11.8758L23.1257 10.2222L20.2578 11.8758V15.1329L23.1257 16.7865L25.9433 15.1329Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_12"
//                                 d="M25.9433 34.1242V30.8671L23.1257 29.2135L20.2578 30.8671V34.1242L23.1257 35.7778L25.9433 34.1242Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_13"
//                                 d="M25.4908 24.3529V21.597L23.126 20.244L20.7109 21.597V24.3529L23.126 25.756L25.4908 24.3529Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_14"
//                                 d="M34.7989 39.1852V35.1765L31.3272 33.1721L27.8555 35.1765V39.1852L31.3272 41.1896L34.7989 39.1852Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_15"
//                                 d="M16.6856 10.2222V6.91507L13.8176 5.26147L10.9497 6.91507V10.2222L13.8176 11.8257L16.6856 10.2222Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_16"
//                                 d="M6.22013 12.9782V11.1242L4.61006 10.1721L3 11.1242V12.9782L4.61006 13.9303L6.22013 12.9782Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_17"
//                                 d="M26.4966 43.9956V39.9868L22.9746 37.9825L19.5029 39.9868V43.9956L22.9746 45.9999L26.4966 43.9956Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_18"
//                                 d="M16.6856 39.0849V35.7777L13.8176 34.1241L10.9497 35.7777V39.0849L13.8176 40.7385L16.6856 39.0849Z"
//                                 fill="#4539CF"
//                             />
//                             <path
//                                 id="Vector_19"
//                                 d="M7.5283 34.8257V32.22L5.26415 30.9172L3 32.22V34.8257L5.26415 36.1285L7.5283 34.8257Z"
//                                 fill="#4539CF"
//                             />
//                         </g>
//                     </svg>
//                 </a>

//                 <div
//                     className="nav flex-md-column nav-pills flex-grow-1"
//                     role="tablist"
//                     aria-orientation="vertical">
//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link"
//                         data-toggle="pill"
//                         href="#nav-tab-user"
//                         role="tab">
//                         <img
//                             src="assets/images/user.png"
//                             className="avatar sm rounded-circle"
//                             alt="user avatar"
//                         />
//                     </a>
//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link active"
//                         data-toggle="pill"
//                         href="#nav-tab-chat"
//                         role="tab">
//                         <i className="zmdi zmdi-home"></i>
//                     </a>
//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link "
//                         data-toggle="pill"
//                         href="#nav-tab-newfriends"
//                         role="tab">
//                         <i className="zmdi zmdi-comment-alert"></i>
//                     </a>
//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link"
//                         data-toggle="pill"
//                         href="#nav-tab-phone"
//                         role="tab">
//                         <i className="zmdi zmdi-phone"></i>
//                     </a>
//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link "
//                         data-toggle="pill"
//                         href="#nav-tab-contact"
//                         role="tab">
//                         <i className="zmdi zmdi-account-circle"></i>
//                     </a>

//                     <a
//                         className="mb-xl-3 mb-md-2 nav-link d-none d-sm-block"
//                         data-toggle="pill"
//                         href="#nav-tab-pages"
//                         role="tab">
//                         <i className="zmdi zmdi-layers"></i>
//                     </a>
//                 </div>

//                 <div
//                     className="nav flex-md-column nav-pills flex-grow-2"
//                     role="tablist"
//                     aria-orientation="vertical">
//                     <a
//                         className="mt-xl-3 mt-md-2 nav-link light-dark-toggle"
//                         href="javascript:void(0);">
//                         <i className="zmdi zmdi-brightness-2"></i>
//                         <input className="light-dark-btn" type="checkbox" />
//                     </a>
//                     <a className="mt-xl-3 mt-md-2 nav-link d-none d-sm-block" href="#" role="tab">
//                         <i className="zmdi zmdi-settings"></i>
//                     </a>
//                 </div>

//                 <button type="submit" className="btn sidebar-toggle-btn shadow-sm">
//                     <i className="zmdi zmdi-menu"></i>
//                 </button>
//             </div>

//             <div className="sidebar border-end py-xl-4 py-3 px-xl-4 px-3">
//                 <div className="tab-content">
//                     <div className="tab-pane fade" id="nav-tab-user" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">简介</h3>
//                             <div>
//                                 <a href="signin.html" title="" className="btn btn-dark">
//                                     退出账号
//                                 </a>
//                             </div>
//                         </div>

//                         <div className="form-group input-group-lg search mb-3">
//                             <i className="zmdi zmdi-search"></i>
//                             <input type="text" className="form-control" placeholder="搜索..." />
//                         </div>

//                         <div className="card border-0 text-center pt-3 mb-4">
//                             <div className="card-body">
//                                 <div className="card-user-avatar">
//                                     <img src="assets/images/user.png" alt="avatar" />
//                                     <button type="button" className="btn btn-secondary btn-sm">
//                                         <i className="zmdi zmdi-edit"></i>
//                                     </button>
//                                 </div>
//                                 <div className="card-user-detail mt-4">
//                                     <h4>Michelle Green</h4>
//                                     <span className="text-muted">
//                                         <a
//                                             href="/cdn-cgi/l/email-protection"
//                                             className="__cf_email__"
//                                             data-cfemail="15787c767d707979703b726770707b557278747c793b767a78">
//                                             [email&#160;protected]
//                                         </a>
//                                     </span>
//                                     <p>+14 123 456 789 - New york (USA)</p>
//                                     <div className="social">
//                                         <a
//                                             className="icon p-2"
//                                             href="#"
//                                             data-toggle="tooltip"
//                                             title="Facebook">
//                                             <i className="zmdi zmdi-facebook-box"></i>
//                                         </a>
//                                         <a
//                                             className="icon p-2"
//                                             href="#"
//                                             data-toggle="tooltip"
//                                             title="Github">
//                                             <i className="zmdi zmdi-github-box"></i>
//                                         </a>
//                                         <a
//                                             className="icon p-2"
//                                             href="#"
//                                             data-toggle="tooltip"
//                                             title="Linkedin">
//                                             <i className="zmdi zmdi-linkedin-box"></i>
//                                         </a>
//                                         <a
//                                             className="icon p-2"
//                                             href="#"
//                                             data-toggle="tooltip"
//                                             title="Instagram">
//                                             <i className="zmdi zmdi-instagram"></i>
//                                         </a>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="card border-0">
//                             <ul className="list-group custom list-group-flush">
//                                 <li className="list-group-item d-flex justify-content-between align-items-center">
//                                     <span>主题颜色</span>
//                                     <ul className="choose-skin list-unstyled mb-0">
//                                         <li
//                                             data-theme="indigo"
//                                             data-toggle="tooltip"
//                                             title="Theme-Indigo">
//                                             <div className="indigo"></div>
//                                         </li>
//                                         <li
//                                             className="active"
//                                             data-theme="cyan"
//                                             data-toggle="tooltip"
//                                             title="Theme-Cyan">
//                                             <div className="cyan"></div>
//                                         </li>
//                                         <li
//                                             data-theme="green"
//                                             data-toggle="tooltip"
//                                             title="Theme-Green">
//                                             <div className="green"></div>
//                                         </li>
//                                         <li
//                                             data-theme="blush"
//                                             data-toggle="tooltip"
//                                             title="Theme-Blush">
//                                             <div className="blush"></div>
//                                         </li>
//                                         <li
//                                             data-theme="dark"
//                                             data-toggle="tooltip"
//                                             title="Theme-Dark">
//                                             <div className="dark"></div>
//                                         </li>
//                                     </ul>
//                                 </li>
//                                 <li className="list-group-item d-flex justify-content-between align-items-center">
//                                     <span>桌面通知</span>
//                                     <label className="c_checkbox">
//                                         <input type="checkbox" checked={false} />
//                                         <span className="checkmark"></span>
//                                     </label>
//                                 </li>
//                                 <li className="list-group-item d-flex justify-content-between align-items-center">
//                                     <span>声音通知</span>
//                                     <label className="c_checkbox">
//                                         <input type="checkbox" />
//                                         <span className="checkmark"></span>
//                                     </label>
//                                 </li>
//                                 <li className="list-group-item border-0 mt-3">
//                                     <a className="link" href="#">
//                                         <i className="zmdi zmdi-chevron-right me-2"></i>{' '}
//                                         需要帮助吗？请联系我们
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="#">
//                                         <i className="zmdi zmdi-chevron-right me-2"></i>{' '}
//                                         Knowledgebase
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="#">
//                                         <i className="zmdi zmdi-chevron-right me-2"></i> english
//                                         (United States)
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item mb-3">
//                                     <a className="link" href="#">
//                                         <i className="zmdi zmdi-chevron-right me-2"></i> Browser &
//                                         App Sessions
//                                     </a>
//                                 </li>
//                             </ul>

//                             <div className="card-body text-center border-top">
//                                 <button type="button" className="btn btn-secondary">
//                                     保存设置
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="tab-pane fade show active" id="nav-tab-chat" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">dMail</h3>
//                             <div>
//                                 <button className="btn btn-dark" type="button">
//                                     {' '}
//                                     新的聊天{' '}
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="form-group input-group-lg search mb-3">
//                             <i className="zmdi zmdi-search"></i>
//                             <input type="text" className="form-control" placeholder="搜索..." />
//                         </div>

//                         <ul className="chat-list">
//                             <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
//                                 <span>最近的消息</span>
//                                 <div className="dropdown">
//                                     <a
//                                         className="btn btn-link px-1 py-0 border-0 text-muted dropdown-toggle"
//                                         href="#"
//                                         role="button"
//                                         data-toggle="dropdown"
//                                         aria-haspopup="true"
//                                         aria-expanded="false">
//                                         <i className="zmdi zmdi-filter-list"></i>
//                                     </a>
//                                     <div className="dropdown-menu dropdown-menu-right">
//                                         <a className="dropdown-item" href="#">
//                                             Action
//                                         </a>
//                                         <a className="dropdown-item" href="#">
//                                             Another action
//                                         </a>
//                                         <a className="dropdown-item" href="#">
//                                             Something else here
//                                         </a>
//                                     </div>
//                                 </div>
//                             </li>

//                             {MessList.map((item, key) => (
//                                 <div key={key} onClick={() => updatechatbody(item)}>
//                                     <Message
//                                         userstate={item.messagebox.userstate}
//                                         user={item.messagebox.user}
//                                         lastime={
//                                             item.multipletext?.[item.multipletext?.length - 1]?.time??""
//                                         }
//                                         inf={
//                                             item.multipletext?.[item.multipletext?.length - 1]?.text??""
//                                         }
//                                         boolcall={item.messagebox.boolcall}
//                                         color={(item.messagebox.color = randomcolor())}></Message>
//                                 </div>
//                             ))}
//                         </ul>
//                     </div>

//                     <div className="tab-pane fade" id="nav-tab-phone" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">通话</h3>
//                             <div>
//                                 <button className="btn btn-dark" type="button">
//                                     新的通话
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="form-group input-group-lg search mb-3">
//                             <i className="zmdi zmdi-search"></i>
//                             <input type="text" className="form-control" placeholder="搜索..." />
//                         </div>

//                         <ul className="chat-list">
//                             <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
//                                 <span>最近的通话</span>
//                                 <div className="dropdown">
//                                     <a
//                                         className="btn btn-link px-1 py-0 border-0 text-muted dropdown-toggle"
//                                         href="#"
//                                         role="button"
//                                         data-toggle="dropdown"
//                                         aria-haspopup="true"
//                                         aria-expanded="false"></a>
//                                     <div className="dropdown-menu dropdown-menu-right">
//                                         <a className="dropdown-item" href="#">
//                                             Action
//                                         </a>
//                                         <a className="dropdown-item" href="#">
//                                             Another action
//                                         </a>
//                                         <a className="dropdown-item" href="#">
//                                             Something else here
//                                         </a>
//                                     </div>
//                                 </div>
//                             </li>
//                             <Message
//                                 userstate=""
//                                 user="测试员1"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员2"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员3"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员4"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                         </ul>
//                     </div>

//                     <div className="tab-pane fade" id="nav-tab-contact" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">通讯录</h3>
//                             <div>
//                                 <button
//                                     className="btn btn-dark"
//                                     type="button"
//                                     data-toggle="modal"
//                                     data-target="#InviteFriends">
//                                     邀请好友
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="form-group input-group-lg search mb-3">
//                             <i className="zmdi zmdi-search"></i>
//                             <input type="text" className="form-control" placeholder="搜索..." />
//                         </div>
//                         <ul className="chat-list">
//                             {sortData.map((item) => (
//                                 <>
//                                     {alphatitle(item.messagebox.user) ? (
//                                         <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
//                                             <span>{currentfirstalpha}</span>
//                                         </li>
//                                     ) : null}
//                                     <div onClick={() => updatechatbody(item)}>
//                                         <Message
//                                             userstate=""
//                                             user={item.messagebox.user}
//                                             lastime=""
//                                             inf={txltime(
//                                                 item.multipletext?.[item.multipletext.length - 1]
//                                                     .time
//                                             )}
//                                             boolcall={false}
//                                             color={
//                                                 (item.messagebox.color = randomcolor())
//                                             }></Message>
//                                     </div>
//                                 </>
//                             ))}
//                         </ul>
//                     </div>
//                     <div className="tab-pane fade" id="nav-tab-newfriends" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">系统通知</h3>
//                         </div>
//                         <div className="form-group input-group-lg search mb-3">
//                             <i className="zmdi zmdi-search"></i>
//                             <input type="text" className="form-control" placeholder="搜索..." />
//                         </div>
//                         <ul className="chat-list">
//                             <li className="header d-flex justify-content-between ps-3 pe-3 mb-1">
//                                 <span>最新的系统通知</span>
//                             </li>
//                             <Message
//                                 userstate=""
//                                 user="测试员1"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员2"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员3"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                             <Message
//                                 userstate=""
//                                 user="测试员4"
//                                 lastime=""
//                                 inf="2023/3/24 12:00 am"
//                                 boolcall={true}></Message>
//                         </ul>
//                     </div>

//                     <div className="tab-pane fade" id="nav-tab-pages" role="tabpanel">
//                         <div className="d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="mb-0 text-primary">发现</h3>
//                         </div>

//                         <div className="card border-0">
//                             <ul className="list-group list-group-flush">
//                                 <li className="list-group-item border-0 mt-3">
//                                     <a className="link" href="signin.html">
//                                         <i className="zmdi zmdi-sign-in me-2"></i> 登陆新的账号
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="signup.html">
//                                         <i className="zmdi zmdi-assignment-account me-2"></i>{' '}
//                                         注册新的账号
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="password-reset.html">
//                                         <i className="zmdi zmdi-key me-2"></i> 更改您的密码
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="settings.html">
//                                         <i className="zmdi zmdi-settings me-2"></i> 设置
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="single-chat.html">
//                                         <i className="zmdi zmdi-account me-2"></i> 私聊
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="group-chat.html">
//                                         <i className="zmdi zmdi-accounts-alt me-2"></i> 群聊
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="audio-call.html">
//                                         <i className="zmdi zmdi-phone-forwarded  me-2"></i> 音频通话
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item border-0">
//                                     <a className="link" href="video-call.html">
//                                         <i className="zmdi zmdi-videocam me-2"></i> 视频通话
//                                     </a>
//                                 </li>
//                                 <li className="list-group-item mb-3">
//                                     <a className="link" href="">
//                                         <i className="zmdi zmdi-file me-2"></i> 文档管理
//                                     </a>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="main px-xl-5 px-lg-4 px-3">
//                 <div className="chat-body">
//                     {Inichat ? (
//                         <LetChatbody
//                             user={Messbody.messagebox.user}
//                             userstate={onlineCN(Messbody.messagebox.userstate ?? '')}
//                             text={Messbody.multipletext}
//                             color={Messbody.messagebox.color}></LetChatbody>
//                     ) : (
//                         <ConstChatbody />
//                     )}
//                 </div>
//             </div>

//             <div className="modal fade" id="InviteFriends" tabIndex={-1} aria-hidden="true">
//                 <div className="modal-dialog">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h5 className="modal-title">邀请好友</h5>
//                             <button
//                                 type="button"
//                                 className="close"
//                                 data-dismiss="modal"
//                                 aria-label="Close">
//                                 <span aria-hidden="true">&times;</span>
//                             </button>
//                         </div>
//                         <div className="modal-body">
//                             <form>
//                                 <div className="form-group">
//                                     <label>邮箱地址</label>
//                                     <input type="email" className="form-control" />
//                                     <small id="emailHelp" className="form-text text-muted">
//                                         您的邮箱不会被用于任何的商业用途
//                                     </small>
//                                 </div>
//                             </form>
//                             <div className="mt-5">
//                                 <button type="button" className="btn btn-primary">
//                                     发送请求
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Home
