import { action } from 'mobx'
import { authStore } from '../stores/authStore'
import { User, userStore } from '../stores/userStore'
import { observer } from 'mobx-react-lite'
import { updateUserStore } from '../stores/updateUserStore'
import { useImmer } from 'use-immer'
import { useEffect, useRef, useState, useCallback } from 'react'
import { modalStore } from '../stores/modalStore'

export const ProfileHeader = () => {
    return (
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 text-primary">主页</h3>
            <div>
                <a className="btn btn-dark" href="#" onClick={authStore.logout}>
                    登出
                </a>
            </div>
        </div>
    )
}

export const CardAvatar = ({ avatarPath }: { avatarPath: string }) => {
    return (
        <div className="card-user-avatar">
            <img src={avatarPath === '' ? 'assets/images/user.png' : avatarPath} alt="avatar" />
            <button type="button" className="btn btn-secondary btn-sm">
                <i className="zmdi zmdi-edit"></i>
            </button>
        </div>
    )
}

export const UserNameInput = observer(({ handleOnBlur }: { handleOnBlur: any }) => {
    const inputRef: any = useRef(null)
    useEffect(() => {
        inputRef.current.focus()
    }, [])

    return (
        <input
            ref={inputRef}
            value={updateUserStore.newUserName}
            onChange={action((e) => (updateUserStore.newUserName = e.target.value))}
            onBlur={handleOnBlur}
        />
    )
})

export const UserName = ({ userName }: { userName: string }) => {
    const [editName, setEditName] = useImmer(false)
    const onKeyDown = useCallback(
        action((e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                updateUserStore.updateType = 'UserName'
                updateUserStore.sendUpdateUserInfo()
                setEditName(false)
            }
        }),
        [updateUserStore]
    )
    const handleOnBlur = () => setEditName(false)
    const handleDoubleClick = useCallback(
        action(() => {
            updateUserStore.newUserName = userName
            setEditName(true)
        }),
        [userName, setEditName]
    )

    useEffect(() => {
        if (editName) {
            window.addEventListener('keydown', onKeyDown)
            return () => window.removeEventListener('keydown', onKeyDown)
        }
    }, [editName, onKeyDown])

    return (
        <div onDoubleClick={handleDoubleClick}>
            {editName ? <UserNameInput handleOnBlur={handleOnBlur} /> : <h5>{userName}</h5>}
        </div>
    )
}

export const CardDetail = ({
    userName,
    email,
    userId,
}: {
    userName: string
    email: string
    userId: number
}) => {
    return (
        <div className="card-user-detail mt-4">
            <UserName userName={userName} />
            <span>
                <a
                    href="#"
                    className="__cf_email__"
                    data-cfemail="412c282229242d2d246f263324242f01262c20282d6f222e2c">
                    {email}
                </a>
            </span>
            <p>{'dMail ID : ' + userId}</p>
        </div>
    )
}

export const ProfileCard = observer(({ user }: { user: User }) => {
    return (
        <div className="card border-0 text-center pt-3 mb-4">
            <div className="card-body">
                <CardAvatar avatarPath={user.avaterPath} />
                <CardDetail userName={user.showName} email={authStore.email} userId={user.userId} />
            </div>
        </div>
    )
})

export const ColorSelectDot = ({
    theme,
    title,
    classname,
}: {
    theme: string
    title: string
    classname: string
}) => {
    const ref :any =useRef(null);
    const handleTheme = (e:any) => {
        var $body: any = document.querySelector('#layout')
        var $this:any = ref.current
        console.log($this?.getAttribute('data-theme'))
        var existTheme: any = document
            .querySelector('.choose-skin li.active')?.getAttribute('data-theme')
        var theme: any = document.querySelectorAll('.choose-skin li')
        for (var i = 0; i < theme.length; i++) {
            theme[i].classList.remove('active')
        }
        $body.classList.remove('theme-' + existTheme)
        $this.classList.add('active')
        $body.classList.add('theme-' +$this.getAttribute('data-theme') )
    }
    return (
        <li
            className={classname}
            data-theme={theme}
            data-toggle="tooltip"
            data-original-title={title}
            onClick={(e) => handleTheme(e)}
            ref={ref}>
            <div className={theme}></div>
        </li>
    )
}

export const ColorScheme = () => {
    return (
        <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>主题颜色</span>
            <ul className="choose-skin list-unstyled mb-0">
                <ColorSelectDot theme="indigo" title="Theme-Indigo" classname="" />
                <ColorSelectDot theme="cyan" title="Theme-Cyan" classname="active" />
                <ColorSelectDot theme="green" title="Theme-Green" classname="" />
                <ColorSelectDot theme="blush" title="Theme-Blush" classname="" />
                <ColorSelectDot theme="dark" title="Theme-Dark" classname="" />
            </ul>
        </li>
    )
}

export const DesktopNotification = () => {
    return (
        <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>桌面消息提醒</span>
            <label className="c_checkbox">
                <input type="checkbox" />
                <span className="checkmark"></span>
            </label>
        </li>
    )
}

export const SoundNotification = () => {
    return (
        <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>消息提示音</span>
            <label className="c_checkbox">
                <input type="checkbox" />
                <span className="checkmark"></span>
            </label>
        </li>
    )
}

export const ChangePassword = () => {
    return (
        <li className="list-group-item border-0 mt-2">
            <a
                className="link"
                type="button"
                onClick={action(() => {
                    modalStore.modalType = 'ChangePassword'
                    modalStore.isOpen = true
                })}>
                <i className="zmdi zmdi-chevron-right me-2"></i>
                {'  修改密码'}
            </a>
        </li>
    )
}

export const ProfileSetting = () => {
    return (
        <div className="card border-0">
            <ul className="list-group custom list-group-flush">
                <ColorScheme />
                <DesktopNotification />
                <SoundNotification />
                <ChangePassword />
            </ul>
            {/* <div className='card-body text-center border-top'>
            <button type='button' className='btn btn-secondary'></button>
        </div> */}
        </div>
    )
}

export const UserProfile = observer(() => {
    return (
        <div className="tab-pane fade" id="nav-tab-user" role="tabpanel">
            <ProfileHeader />
            <ProfileCard user={userStore.getUser(authStore.userId)} />
            <ProfileSetting />
        </div>
    )
})
