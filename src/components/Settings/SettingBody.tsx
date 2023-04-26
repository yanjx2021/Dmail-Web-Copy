import { action } from 'mobx'
import { authStore } from '../../stores/authStore'
import { User, userStore } from '../../stores/userStore'
import { observer } from 'mobx-react-lite'
import { updateUserStore } from '../../stores/updateUserStore'
import { useImmer } from 'use-immer'
import { useEffect, useRef, useState, useCallback } from 'react'
import { modalStore } from '../../stores/modalStore'
import { SettingGeneral } from './SettingGeneral'


export const SettingBody = observer(() => {
    return (
        <div className="body-page d-flex py-xl-3 py-2">
            <div className="container px-0">
                <Row/>
                <div className="tab-content">
                    <SettingGeneral/>

                    <div className="tab-pane fade" id="setting-security" role="tabpanel">
                        <div className="row justify-content-between mb-4">
                            <div className="col-12 col-md-6">
                                <h5>Change your password</h5>
                                <p className="text-muted mb-md-0">
                                    We will email you a confirmation when changing your password, so
                                    please expect that email after submitting.
                                </p>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-warning">Forgot your password?</button>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <form className="row">
                                            <div className="col-lg-4 col-md-12">
                                                <div className="form-group mb-3">
                                                    <label>Current password</label>
                                                    <input type="email" className="form-control" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label>New password</label>
                                                    <input type="email" className="form-control" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label>Confirm password</label>
                                                    <input type="email" className="form-control" />
                                                </div>
                                                <button type="button" className="btn btn-primary">
                                                    Update Password
                                                </button>
                                                <button type="button" className="btn btn-link">
                                                    Cancel
                                                </button>
                                            </div>
                                            <div className="col-lg-8 col-md-12">
                                                <div className="card bg-light border">
                                                    <div className="card-body">
                                                        <p className="mb-2">
                                                            Password requirements
                                                        </p>
                                                        <p className="small text-muted mb-2">
                                                            To create a new password, you have to
                                                            meet all of the following requirements:
                                                        </p>

                                                        <ul className="small text-muted ps-4 mb-0">
                                                            <li>Minimum 8 character</li>
                                                            <li>At least one special character</li>
                                                            <li>At least one number</li>
                                                            <li>
                                                                Can’t be the same as a previous
                                                                password
                                                            </li>
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
                </div>
            </div>
        </div>
    )
})
const Row = () => {
  return (
      <div className="row">
          <div className="col-12">
              <ul className="nav nav-tabs nav-overflow page-header-tabs mb-4 mt-md-5 mt-3">
                  <NavItem state='active' href="#setting-general" text="常规"/>
                  <NavItem state='' href="#setting-security" text="安全"/>
              </ul>
          </div>
      </div>
  )
}
const NavItem=observer(({state,href,text}:{state:string,href:string,text:string})=>
{
return(
  <li className="nav-item">
                      <a
                          className={"nav-link "+state}
                          data-toggle="tab"
                          href={href}
                          role="tab">
                          {text}
                      </a>
                  </li>
)
})