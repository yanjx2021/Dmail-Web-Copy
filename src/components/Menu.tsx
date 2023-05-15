import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { authStore } from '../stores/authStore'
import { homeStore } from '../pages/Home'
import { action } from 'mobx'

const Menu = observer(() => {
    const handleMenu = () => {
        if (!document.body.classList.contains('open-sidebar-menu'))
            document.body.classList.add('open-sidebar-menu')
        else document.body.classList.remove('open-sidebar-menu')
    }
    function switchTheme(e: any) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-theme', 'light')
            localStorage.setItem('theme', 'light')
        }
    }
    const handleDarkTheme = () => {
        var ldToggle: any = document.querySelector('.light-dark-toggle')
        if (!ldToggle.classList.contains('active')) ldToggle.classList.add('active')
        else ldToggle.classList.remove('active')
    }

    useEffect(() => {
        var ldToggle: any = document.querySelector('.light-dark-toggle')
        var toggleSwitch: any = document.querySelector('.light-dark-toggle input[type="checkbox"]')
        var currentTheme = localStorage.getItem('theme')
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme)
            if (currentTheme === 'dark') {
                toggleSwitch.checked = true
                ldToggle.classList.add('active')
            }
        }
        toggleSwitch.addEventListener('change', switchTheme, false)
    }, [])

    return (
        <div className="navigation navbar justify-content-center py-xl-4 py-md-3 py-0 px-3">
            <a href="/home" title="dMail" className="brand" onClick={(e) => e.preventDefault()}>
                {/* <img src="assets/logo.jpg" className="avatar md rounded-circle " /> */}
                <div className="avatar rounded-circle no-image timber">
                    <span>{authStore.userId}</span>
                </div>
            </a>
            <div
                className="nav flex-md-column nav-pills flex-grow-1"
                role="tablist"
                aria-orientation="vertical">
                <a
                    className="mb-xl-3 mb-md-2 nav-link"
                    data-toggle="pill"
                    href="#nav-tab-user"
                    role="tab">
                    <img
                        src="assets/images/user.png"
                        className="avatar sm rounded-circle"
                        alt="user avatar"
                    />
                </a>
                <a
                    className="mb-xl-3 mb-md-2 nav-link active"
                    data-toggle="pill"
                    href="#nav-tab-chat"
                    role="tab">
                    <i className="zmdi zmdi-home"></i>
                </a>
                <a
                    className="mb-xl-3 mb-md-2 nav-link "
                    data-toggle="pill"
                    href="#nav-tab-newfriends"
                    role="tab">
                    <i className="zmdi zmdi-comment-alert"></i>
                </a>
                <a
                    className="mb-xl-3 mb-md-2 nav-link "
                    data-toggle="pill"
                    href="#nav-tab-contact"
                    role="tab">
                    <i className="zmdi zmdi-account-circle"></i>
                </a>

            </div>

            <div
                className="nav flex-md-column nav-pills flex-grow-2"
                role="tablist"
                aria-orientation="vertical">
                <a
                    className="mt-xl-3 mt-md-2 nav-link light-dark-toggle"
                    href="#"
                    onClick={() => handleDarkTheme()}>
                    <i className="zmdi zmdi-brightness-2"></i>
                    <input className="light-dark-btn" type="checkbox" />
                </a>
                <a
                    className="mt-xl-3 mt-md-2 nav-link d-none d-sm-block"
                    href="#"
                    role="tab"
                    onClick={action(() => {
                        homeStore.openSetting = !homeStore.openSetting
                    })}>
                    <i className="zmdi zmdi-settings"></i>
                </a>
            </div>

            <button
                type="submit"
                className="btn sidebar-toggle-btn shadow-sm"
                onClick={() => handleMenu()}>
                <i className="zmdi zmdi-menu"></i>
            </button>
        </div>
    )
})
export default Menu
