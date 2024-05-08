import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"
import {Avatar} from "primereact/avatar";
import Link from "next/link";
import {Button} from "primereact/button";

export default function Navbar(props) {
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)
    const mediaQuery = useMediaQuery({maxWidth: 1280})

    useEffect(() => {
        setIsMobile(mediaQuery)
    }, [mediaQuery])

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
                <Button icon="pi pi-home" label={isMobile ? "" : "Retourner à l'accueil"} rounded />
            </Link>

            <div className="navbar-item">
                <img alt="Logo" />
            </div>

            <div className="navbar-item" onClick={handleLogout}>
                <Avatar image={props.user.profilePicture} size="large" shape="circle"/>
                {!isMobile && <span className="username">{props.user.username}</span>}
            </div>
        </div>
    )
}