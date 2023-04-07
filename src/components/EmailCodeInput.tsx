import React, { useCallback, useState } from "react"
import axios from 'axios'
import { useImmer } from 'use-immer'

const emailCodeCoolDown = 60

export const EmailCodeInput = (props: {email : string, emailCode : string, setEmailCode : (code : string) => any}) => {
    const [curCoolDown, setCurCoolDown] = useImmer(0)

    const {email, emailCode, setEmailCode} = props;
    
    const onEmailCodeInputChange = useCallback((e : React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/[^0-9]/g, '')
        setEmailCode(input)
    }, [setEmailCode])

    const onSendEmailButtonClicked = useCallback(() => {
        axios.post('/api/email/code', { email: email })
        setCurCoolDown(emailCodeCoolDown)
        const timer = setInterval(() => setCurCoolDown((draft) => { draft -= 1 }), 1000)
        setTimeout(() => { 
            setCurCoolDown(0)
            clearTimeout(timer)
        }, emailCodeCoolDown)
    }, [email, setCurCoolDown])

    return (<div className="input-group mb-4">
        <input
            type="text"
            className="form-control form-control-lg"
            placeholder="请输入验证码"
            value={emailCode}
            onChange={onEmailCodeInputChange}
        />
        <button
            className="btn btn-lg btn-primary"
            disabled={curCoolDown > 0}
            onClick={onSendEmailButtonClicked}>
            {curCoolDown <= 0 ? '发送验证码' : curCoolDown + 's'}
        </button>
    </div>)
}