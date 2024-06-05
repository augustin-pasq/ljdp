import {Avatar} from "primereact/avatar"
import {Button} from "primereact/button"
import Link from "next/link"
import {useRouter} from "next/router"

export default function Navbar(props) {
    const router = useRouter()

    const handleLogout = async () => {
        const request = await fetch("/api/user/logout", {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        })

        if(request.status === 200) {
            await router.push("/")
        }
    }

    return (
        <div id="navbar">
            <Link className="navbar-item" href="/">
                <Button icon="pi pi-home" label={props.isMobile ? "" : "Retourner à l'accueil"} rounded />
            </Link>

            <div className="navbar-item">
                <img src={""} alt="Logo" />
            </div>

            <div className="navbar-item" onClick={handleLogout}>
                <Avatar image={props.user.profilePicture} size="large" shape="circle"/>
                {!props.isMobile && <span className="username">{props.user.username}</span>}
            </div>
        </div>
    )
}