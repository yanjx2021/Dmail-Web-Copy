import DOMPurify from "dompurify"


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
