
export const showMessageNotification = (title: string, body: string, tag: string) => {
    if (window.Notification) {
        Notification.requestPermission()
        const notification = new Notification(title, {
            body,
            tag,
        })
        notification.onclick = () => {
            notification.close()
        }
    } else {
        alert('不支持Web Notification')
    }
}
