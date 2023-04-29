import { Button } from 'antd'
import { observer } from 'mobx-react-lite'
import { useState, useCallback, useEffect } from 'react'
import { ExternalApiStore, externalStore } from '../../stores/externalStore'
import { action } from 'mobx'

export const SettingExternal = observer(() => {
    useEffect(() => {
        externalStore.load()
    }, [])

    return (
        <div className="tab-pane fade" id="setting-external" role="tabpanel">
            <h2>您的秘钥不会被上传</h2>
            <h3>翻译服务</h3>
            <div>
                <p>百度ID</p>
                <input
                    onChange={action((e) => {
                        externalStore.baiduTranslateId = e.target.value
                    })}
                    value={externalStore.baiduTranslateId}></input>
            </div>
            <div>
                <p>百度KEY</p>
                <input
                    onChange={action((e) => (externalStore.baiduTransalteKey = e.target.value))}
                    value={externalStore.baiduTransalteKey}></input>
            </div>
            <h3>语音识别</h3>
            <div>
                <p>百度AI开放平台 Access Token</p>
                <input
                    onChange={action((e) => {
                        externalStore.baiduAiToken = e.target.value
                    })}
                    value={externalStore.baiduAiToken}></input>
            </div>
            <button onClick={externalStore.save}>保存</button>
        </div>
    )
})
