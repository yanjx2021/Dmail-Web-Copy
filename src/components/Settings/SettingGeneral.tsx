import { action } from 'mobx'
import { authStore } from '../../stores/authStore'
import { User, userStore } from '../../stores/userStore'
import { observer } from 'mobx-react-lite'
import { updateUserStore } from '../../stores/updateUserStore'
import { useImmer } from 'use-immer'
import { useEffect, useRef, useState, useCallback } from 'react'
import { modalStore } from '../../stores/modalStore'

export const SettingGeneral = () => {
    const handlefile = () => {
        document.getElementById('userphoto')?.click()
    }
    return (
        <div className="tab-pane fade show active" id="setting-general" role="tabpanel">
            <div className="row">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">账户设置</h6>
                            <span className="text-muted small">更新账户信息</span>
                        </div>
                        <div className="card-body">
                            <form className="row g-3">
                                <InfInputer placeholder={'昵称...'} />
                                <InfInputer placeholder={'手机号...'} />
                                <InfInputer placeholder={'邮箱...'} />
                                <InfInputer placeholder={'微信帐号...'} />
                                <InfInputer placeholder={'QQ帐号...'} />
                                <InfInputer placeholder={'Github账号...'} />
                                <div className="col-12">
                                    <div className="form-group">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={handlefile}>
                                            <i className="zmdi zmdi-edit"></i>更改头像
                                        </button>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <textarea
                                                rows={4}
                                                className="form-control text-footerform"
                                                placeholder="输入个人简介..."></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <button type="button" className="btn btn-primary">
                                        更新信息
                                    </button>
                                    <button type="button" className="btn link">
                                        取消
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteUser />
        </div>
    )
}
export const InfInputer = ({ placeholder }: { placeholder: string }) => {
    return (
        <div className="col-lg-4 col-md-6 col-sm-12">
            <div className="form-group">
                <div className="input-group ">
                    <input
                        type="text"
                        className="form-control form-control-lg text-footerform "
                        placeholder={placeholder}
                    />
                </div>
            </div>
        </div>
    )
}
const DeleteUser = () => {
    return (
        <div className="row justify-content-between mt-4">
            <div className="col-12 col-md-6">
                <h5>注销您的账号</h5>
                <p className="text-muted mb-md-0">
                    请注意，删除您的帐户是一项永久性操作，一旦完成将无法恢复。
                </p>
            </div>
            <div className="col-auto">
                <button className="btn btn-danger">注销</button>
            </div>
        </div>
    )
}
