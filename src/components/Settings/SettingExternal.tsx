import { observer } from 'mobx-react-lite'
import { externalStore } from '../../stores/externalStore'
import { action } from 'mobx'

export const SettingExternal = observer(() => {
    return (
        <div className="tab-pane fade" id="setting-external" role="tabpanel">
            <ExternalHead />
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">翻译服务</h6>
                        </div>
                        <div className="card-body">
                            <form className="row g-3">
                                <div>
                                    <div className="form-group mb-3">
                                        <label>百度ID</label>
                                        <input
                                            className="form-control text-footerform"
                                            onChange={action((e) => {
                                                externalStore.baiduTranslateId = e.target.value
                                            })}
                                            value={externalStore.baiduTranslateId}></input>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>百度KEY</label>
                                        <input
                                            className="form-control text-footerform"
                                            onChange={action(
                                                (e) =>
                                                    (externalStore.baiduTransalteKey =
                                                        e.target.value)
                                            )}
                                            value={externalStore.baiduTransalteKey}></input>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="card-header">
                            <h6 className="card-title mb-0">语音识别</h6>
                        </div>

                        <div className="card-body">
                            <form className="row g-3">
                                <div>
                                    <div className="form-group mb-3">
                                        <label>百度AI Token</label>
                                        <input
                                            className="form-control text-footerform"
                                            onChange={action((e) => {
                                                externalStore.baiduAiToken = e.target.value
                                            })}
                                            value={externalStore.baiduAiToken}></input>
                                    </div>
                                </div>

                                <div>
                                    <div className="form-group mb-3">
                                        <label>腾讯云 Id</label>
                                        <input
                                            className="form-control text-footerform"
                                            onChange={action((e) => {
                                                externalStore.tencentCloudId = e.target.value
                                            })}
                                            value={externalStore.tencentCloudId}></input>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label>腾讯云 Key</label>
                                        <input
                                            className="form-control text-footerform"
                                            onChange={action((e) => {
                                                externalStore.tencentCloudKey = e.target.value
                                            })}
                                            value={externalStore.tencentCloudKey}></input>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={externalStore.save}>
                                        保存
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
const ExternalHead = () => {
    return (
        <div className="row justify-content-between mb-4">
            <div className="col-12 col-md-6">
                <h5>外部拓展服务</h5>
                <p className="text-muted mb-md-0">请放心，您的秘钥不会被上传。</p>
            </div>
        </div>
    )
}
