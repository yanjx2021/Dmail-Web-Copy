export const passwordTester = new RegExp('^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$')
export const strongRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(.{8,20})$'
)
export const mediumRegex = new RegExp(
    '^((?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])|(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])|(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(.{8,20})$'
)
export const emailTester = new RegExp('^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$')

export const emailTest = (email: string) =>{
    if (email === '' || emailTester.test(email)) {
        return <div></div>
    } else {
        return <div style={{ color: 'red', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>邮箱格式错误</div>
    }
}

export const strengthTest = (password: string) => {
    if (strongRegex.test(password)) {
        return <div style={{ color: 'green', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>密码强度: 强</div>
    } else if (mediumRegex.test(password)) {
        return <div style={{ color: '#c4870d', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>密码强度: 中</div>
    } else if (passwordTester.test(password)) {
        return <div style={{ color: 'red', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>密码强度: 低</div>
    } else {
        return <div style={{ color: 'red', position: 'absolute', zIndex: 9999, backgroundColor: 'white' }}>请使用8-20位,至少包含数字和字母的密码</div>
    }
}
