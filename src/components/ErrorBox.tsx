import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import '../styles/ErrorBox.css'
//TODO-yjx
const timeout = 3000
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
        <div className="overlay" tabIndex={-1}>
            <div className="modal-box">
                <h4>{title}</h4>
                <p>{error}</p>
                <button className="x-btn" onClick={() => setError('')} />
            </div>
        </div>
    )
}
