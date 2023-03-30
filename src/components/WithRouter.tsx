import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function withRouter(Child: any) {
    return (props:any) => {
        const location = useLocation()
        const navigate = useNavigate()
        const params = useParams()
        return <Child location={location} params={params} navigate={navigate} />
    }
}