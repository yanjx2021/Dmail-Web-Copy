import { action } from 'mobx'
import { authStore } from '../../stores/authStore'
import { User, userStore } from '../../stores/userStore'
import { observer } from 'mobx-react-lite'
import { updateUserStore } from '../../stores/updateUserStore'
import { useImmer } from 'use-immer'
import { useEffect, useRef, useState, useCallback } from 'react'
import { modalStore } from '../../stores/modalStore'
import { SettingGeneral } from './SettingGeneral'
import { SettingSecurity } from './SettingSecurity'


export const SettingBody = observer(() => {
    return (
        <div className="body-page d-flex py-xl-3 py-2">
            <div className="container px-0">
                <Row/>
                <div className="tab-content">
                    <SettingGeneral/>

                    <SettingSecurity/>
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