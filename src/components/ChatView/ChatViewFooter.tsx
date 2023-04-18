import { useEffect, useRef, useState } from 'react'
import '../../styles/ChatViewFooter.css'

//针对输入框数值的一些常数
const lineHeight = 15,
    borderTop = 1,
    borderBottom = 1

export const ChatViewFooter = (props: { handleSend: Function }) => {
    // 消息发送在父组件处理
    // 接受ChatId
    const [text, setText] = useState<string>('')
    const inputRef: any = useRef<HTMLTextAreaElement>(null)

    const handleValueChange = () => {
        let height = parseInt(getComputedStyle(inputRef!.current).height.slice(0, -2), 10)
        if (inputRef!.current.scrollHeight > height) {
            inputRef!.current.style.height = `${
                inputRef!.current.scrollHeight + borderTop + borderBottom
            }px`
        } else {
            while (height >= inputRef!.current.scrollHeight) {
                inputRef!.current.style.height = `${height - lineHeight}px`
                height -= lineHeight
            }
            inputRef!.current.style.height = `${height + lineHeight}px`
        }
        setText(inputRef!.current.value)
    }
    const handleSend = () => {
        props.handleSend(text)
        setText('')
        inputRef!.current.style.height = `0px`
    }
    const onKeyDown = (e: any) => {
        if (e.key === 'Enter' && !checktext()) {
            handleSend()
        }
    }
    const checktext = () => {
        var reg = /^\s*$/g
        if (reg.test(text) || text.length > 500) return true
        return false
    }
    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    })

    return (
        <div className="chat-footer border-top py-xl-4 py-lg-2 py-2">
            <div className="container-xxl">
                <div className="row">
                    <div className="col-12">
                        <div className="input-group align-items-center">
                            <textarea
                                className="form-control border-0 pl-0"
                                placeholder="请输入您的消息..."
                                id="textinputer"
                                onChange={() => handleValueChange()}
                                value={text}
                                ref={inputRef}
                            />
                            <div className="input-group-append d-none d-sm-block">
                                <span className="input-group-text border-0">
                                    <button
                                        className="btn btn-sm btn-link text-muted"
                                        data-toggle="tooltip"
                                        title="清空"
                                        type="button"
                                        onClick={() => {
                                            setText('')
                                            inputRef!.current.style.height = `0px`
                                        }}>
                                        <i className="zmdi zmdi-refresh font-22"></i>
                                    </button>
                                </span>
                            </div>
                            <div className="input-group-append">
                                <span className="input-group-text border-0">
                                    <button
                                        className="btn btn-sm btn-link text-muted"
                                        data-toggle="tooltip"
                                        title="表情"
                                        type="button">
                                        <i className="zmdi zmdi-mood font-22"></i>
                                    </button>
                                </span>
                            </div>
                            <div className="input-group-append">
                                <span className="input-group-text border-0">
                                    <button
                                        className="btn btn-sm btn-link text-muted"
                                        data-toggle="tooltip"
                                        title="附件"
                                        type="button">
                                        <i className="zmdi zmdi-attachment font-22"></i>
                                    </button>
                                </span>
                            </div>

                            <div className="input-group-append">
                                <span className="input-group-text border-0 pr-0">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onKeyDown={onKeyDown}
                                        onClick={handleSend}
                                        //不能发空格串，最大长度500字
                                        disabled={checktext() ? true : false}>
                                        <span className="d-none d-md-inline-block me-2">发送</span>
                                        <i className="zmdi zmdi-mail-send"></i>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
