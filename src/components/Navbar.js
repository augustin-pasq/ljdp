import {Avatar} from "primereact/avatar"
import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

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
            {!isMobile && <img alt="Logo" />}

            <div id="items-container">
                <div className="item" onClick={async () => {await router.push("/home")}}>
                    <span>Jouer</span>
                    <span>▶️</span>
                </div>
                <div className="item">
                    <span>Amis</span>
                    <span>🧑</span>
                </div>

                <div className="item">
                    <span>Parties</span>
                    <span>🏆</span>
                </div>

                {isMobile && <Avatar image={props.user.profilePicture} size="large" shape="circle" onClick={handleLogout}/>}
            </div>

            {!isMobile &&
                <div id="avatar-container">
                    <Avatar image={props.user.profilePicture} size="xlarge" shape="circle" onClick={handleLogout}/>
                    <span id="displayed-name">{props.user.username}</span>
                    <span>{props.user.displayedName}</span>
                </div>
            }
        </div>
    )
}