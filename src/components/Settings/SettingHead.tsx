import { action } from 'mobx'
import { homeStore } from '../../pages/Home'

export const SettingHead = () => {
    return (
        <div className="body-header border-bottom py-xl-3 py-2">
            <div className="container px-0">
                <div className="row align-items-center">
                    <div className="col-12">
                        <div className="media">
                            <div className="avatar sm">
                                <a
                                    href="#"
                                    title=""
                                    className="link"
                                    onClick={action(() => {
                                        homeStore.openSetting = false
                                    })}>
                                    <i className="zmdi zmdi-arrow-left zmdi-hc-lg"></i>
                                </a>
                            </div>
                            <div className="media-body overflow-hidden">
                                <div className="d-flex align-items-center mb-1">
                                    <h6 className="fw-bold text-truncate mb-0 me-auto">设置</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
