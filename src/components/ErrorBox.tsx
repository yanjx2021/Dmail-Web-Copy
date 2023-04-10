import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
//TODO-yjx
const timeout = 4000
export const ErrorBox = ({
    title,
    error,
    setError,
}: {
    title: string
    error: string
    setError: (error: string) => any
}) => {
    useEffect(() => {
        if (error !== '') {
            setTimeout(() => {
                setError('')
            }, timeout)
        }
    }, [error])

    return (
        <div tabIndex={999}>
            <h4>{title}</h4>
            <p>{error}</p>
        </div>
    )
}
