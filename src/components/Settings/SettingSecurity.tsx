import { action } from 'mobx'
import { authStore } from '../../stores/authStore'
import { User, userStore } from '../../stores/userStore'
import { observer } from 'mobx-react-lite'
import { updateUserStore } from '../../stores/updateUserStore'
import { useImmer } from 'use-immer'
import { useEffect, useRef, useState, useCallback } from 'react'
import { modalStore } from '../../stores/modalStore'

export const SettingSecurity = observer(() => {
    return (
        <div className="tab-pane fade" id="setting-security" role="tabpanel">
            <SecurityHead/>
            <div className="row g-3">
                <div className="col-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <form className="row">
                                <div className="col-lg-4 col-md-12">
                                    <InfInputer text={"当前密码"}/>
                                    <InfInputer text={"新密码"}/>
                                    <InfInputer text={"重复新密码"}/>
                                    <button type="button" className="btn btn-primary">
                                        更新密码
                                    </button>
                                    <button type="button" className="btn link">
                                        取消
                                    </button>
                                </div>
                                <div className="col-lg-8 col-md-12">
                                    <div className="card bg-light border">
                                        <div className="card-body">
                                            <p className="mb-2">密码要求</p>
                                            <p className="small text-muted mb-2">
                                            要创建新密码，您必须满足以下所有要求：
                                            </p>

                                            <ul className="small text-muted ps-4 mb-0">
                                                <li>最少 8 个字符</li>
                                                <li>至少一个数字</li>
                                                <li>至少一个英文字母</li>
                                                <li>不能与以前的密码相同</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
const InfInputer = observer(({ text }: { text: string }) => {
    return (
      <div className="form-group mb-3 ">
      <label>{text}</label>
      <input type="email" className="form-control text-footerform" />
  </div>
    )
})
const SecurityHead = () => {
    return (
      <div className="row justify-content-between mb-4">
      <div className="col-12 col-md-6">
          <h5>更改密码</h5>
          <p className="text-muted mb-md-0">
          更改密码时，我们将通过电子邮件向您发送确认，因此请在提交后接收该电子邮件。
          </p>
      </div>
      <div className="col-auto">
          <button className="btn btn-warning">忘记密码?</button>
      </div>
  </div>
    )
}
