export const ChatDropDown = () => {
    return (
        <div className="dropdown">
            <a
                className="text-muted ms-1 p-2 text-muted"
                href="#"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                <i className="zmdi zmdi-more-vert"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-right">
                <a className="dropdown-item" href="#">设置二次验证</a>
            </div>
        </div>
    )
}
