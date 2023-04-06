const Menu = () => {
    return (
        <div className="navigation navbar justify-content-center py-xl-4 py-md-3 py-0 px-3">
            <a href="/home" title="dMail" className="brand">
                <img src="assets/logo.jpg" className="avatar md rounded-circle " />
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
                    className="mb-xl-3 mb-md-2 nav-link"
                    data-toggle="pill"
                    href="#nav-tab-phone"
                    role="tab">
                    <i className="zmdi zmdi-phone"></i>
                </a>
                <a
                    className="mb-xl-3 mb-md-2 nav-link "
                    data-toggle="pill"
                    href="#nav-tab-contact"
                    role="tab">
                    <i className="zmdi zmdi-account-circle"></i>
                </a>

                <a
                    className="mb-xl-3 mb-md-2 nav-link d-none d-sm-block"
                    data-toggle="pill"
                    href="#nav-tab-pages"
                    role="tab">
                    <i className="zmdi zmdi-layers"></i>
                </a>
            </div>

            <div
                className="nav flex-md-column nav-pills flex-grow-2"
                role="tablist"
                aria-orientation="vertical">
                <a
                    className="mt-xl-3 mt-md-2 nav-link light-dark-toggle"
                    href="javascript:void(0);">
                    <i className="zmdi zmdi-brightness-2"></i>
                    <input className="light-dark-btn" type="checkbox" />
                </a>
                <a className="mt-xl-3 mt-md-2 nav-link d-none d-sm-block" href="#" role="tab">
                    <i className="zmdi zmdi-settings"></i>
                </a>
            </div>

            <button type="submit" className="btn sidebar-toggle-btn shadow-sm">
                <i className="zmdi zmdi-menu"></i>
            </button>
        </div>
    )
}

export default Menu