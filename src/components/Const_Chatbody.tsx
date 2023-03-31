const ConstChatbody = (props: any) => {
    return (
        <div className="chat d-flex justify-content-center align-items-center h-100 text-center py-xl-4 py-md-3 py-2">
            <div className="container-xxl">
                <div className="avatar lg avatar-bg me-auto ms-auto mb-5">
                    <img
                        className="avatar lg rounded-circle border"
                        src="assets/images/user.png"
                        alt=""
                    />
                    <span className="a-bg-1"></span>
                    <span className="a-bg-2"></span>
                </div>
                <h5 className="font-weight-bold">欢迎回来！</h5>
                <p>请选择一个聊天以开启对话。</p>
            </div>
        </div>
    )
}
export default ConstChatbody
