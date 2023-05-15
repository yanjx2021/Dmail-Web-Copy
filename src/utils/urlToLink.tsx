import DOMPurify from "dompurify"

export const renderFormatMention = (content: string, userIds: number[], chatId: number, timestamp : number) => {
    if (!content) {
        return null
    }
    const clean = DOMPurify.sanitize(content)
    let urlPattern =
        /(https?:\/\/|www\.)[a-zA-Z_0-9\-@]+(\.\w[a-zA-Z_0-9\-:]+)+(\/[\(\)~#&\-=?\+\%/\.\w]+)?/g
    let i = -1
    const atPattern = /(@)([^@]+?)\(([0-9]+)\)(\s)/g
        let preContent = clean.replace(urlPattern, function (match: string) {
        let href = match
        if (match.indexOf('http') === -1) {
            href = 'http://' + match
        }
        return '<a target="_blank" href="' + href + '">' + match + '</a>'
    })

    preContent = preContent.replace(atPattern, function (match: string) {
        i = i + 1;
        //TODO: yjx 这个地方是提及类型消息的@部分，让这个@变色，并且摆放在一行内
        return `<p id=AtUser${chatId}${userIds[i]}${timestamp}${i}>` + match + '</p>'
    })
    
    return (
        <div>
            <div
                dangerouslySetInnerHTML={{
                   __html: preContent.toString().split('\n').join('<br/>'),
                }}
            />
            {/* <script dangerouslySetInnerHTML={{
                   __html: preContent.toString().split('\n').join('<br/>'),
                }}/> */}
        </div>
        
    )
}


export const renderFormatUrl = (content: string) => {
    if (!content) {
        return null
    }
    const clean = DOMPurify.sanitize(content)
    let urlPattern =
        /(https?:\/\/|www\.)[a-zA-Z_0-9\-@]+(\.\w[a-zA-Z_0-9\-:]+)+(\/[\(\)~#&\-=?\+\%/\.\w]+)?/g
    let preContent = clean.replace(urlPattern, function (match: string) {
        let href = match
        if (match.indexOf('http') === -1) {
            href = 'http://' + match
        }
        return '<a target="_blank" href="' + href + '">' + match + '</a>'
    })

    return (
        <div
            dangerouslySetInnerHTML={{
                __html: preContent.toString().split('\n').join('<br/>'),
            }}
        />
    )
}
