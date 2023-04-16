import { action } from 'mobx'
import { authStore } from '../stores/authStore'
import { User, userStore } from '../stores/userStore'
import { observer } from 'mobx-react-lite'

export const ProfileHeader = observer(() => {
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
})

export const CardAvatar = observer(({avatarPath} : {avatarPath: string}) => {
    return (<div className='card-user-avatar'>
        <img src={avatarPath === '' ? 'assets/images/user.png' : avatarPath} alt='avatar' />
        <button type='button' className='btn btn-secondary btn-sm'>
            <i className='zmdi zmdi-edit'></i>
        </button>
    </div>)
})

export const CardDetail = observer(({userName, email, userId} : {userName: string, email: string, userId: number}) => {
    return (<div className='card-user-detail mt-4'>
        <h5>{userName}</h5>
        <span>
            <a href='#' className='__cf_email__' data-cfemail='412c282229242d2d246f263324242f01262c20282d6f222e2c'>
            {email}
            </a>
        </span>
        <p>{'dMail ID : ' + userId}</p>
    </div>)
})

export const ProfileCard = observer(({user}: {user: User}) => {
    return (<div className='card border-0 text-center pt-3 mb-4'>
        <div className='card-body'>
            <CardAvatar avatarPath={user.avaterPath}/>
            <CardDetail userName={user.showName} email={authStore.email} userId={user.userId}/>
        </div>
    </div>)
})

export const ColorSelectDot = ({theme, title}: {theme: string, title: string}) => {
    return <li data-theme={theme} data-toggle="tooltip" data-original-title={title}>
        <div className={theme}></div>
    </li>
}

export const ColorScheme = () => {
    return (<li className='list-group-item d-flex justify-content-between align-items-center'>
        <span>主题颜色</span>
        <ul className='choose-skin list-unstyled mb-0'>
            <ColorSelectDot theme='indigo' title='Theme-Indigo'/>
            <ColorSelectDot theme='cyan' title='Theme-Cyan'/>
            <ColorSelectDot theme='green' title='Theme-Green'/>
            <ColorSelectDot theme='blush' title='Theme-Blush'/>
            <ColorSelectDot theme='dark' title='Theme-Dark'/>
        </ul>
    </li>)
}

export const DesktopNotification = () => {
    return <li className='list-group-item d-flex justify-content-between align-items-center'>
        <span>桌面消息提醒</span>
        <label className='c_checkbox'>
            <input type='checkbox' />
            <span className='checkmark'></span>
        </label>
    </li>
}

export const SoundNotification = () => {
    return <li className='list-group-item d-flex justify-content-between align-items-center'>
        <span>消息提示音</span>
        <label className='c_checkbox'>
            <input type='checkbox' />
            <span className='checkmark'></span>
        </label>
    </li>
}

export const ChangePassword = () => {
    return <li className='list-group-item border-0 mt-2'>
        <a className='link' href='#'>
            <i className='zmdi zmdi-chevron-right me-2'>
            </i>
            {'  修改密码'}
        </a>
    </li>
}

export const ProfileSetting = observer(() => {
    return (<div className='card border-0'>
        <ul className='list-group custom list-group-flush'>
            <ColorScheme />
            <DesktopNotification />
            <SoundNotification />
            <ChangePassword />
        </ul>
        {/* <div className='card-body text-center border-top'>
            <button type='button' className='btn btn-secondary'></button>
        </div> */}
    </div>)
})

export const UserProfile = observer(() => {
    return <div className='tab-pane fade' id='nav-tab-user' role='tabpanel'>
        <ProfileHeader />
        <ProfileCard user={userStore.getUser(authStore.userId)}/>
        <ProfileSetting />
    </div>
})