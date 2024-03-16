import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import Navbar from "@/components/Navbar"
import React from "react"
import {useRouter} from "next/router"

export default function Home(props) {
    const router = useRouter()

    const navigateNewGame = async () => {
        const request = await fetch("/api/game/createGame", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(props),
        })

        if(request.status === 200) {
            const data = await request.json()
            await router.push({
                pathname: "/edit",
                query: {accessCode: data.content.accessCode},
            }, "/edit")
        }
    }

    return (
        <>
            <Navbar user={props.user}/>
            <main id="home">
                <div className="item" onClick={navigateNewGame}>
                    <span className="item-title">Créer une partie</span>
                    <span className="item-emoji">🚀</span>
                </div>
                <div className="item" onClick={async () => {await router.push("/edit")}}>
                    <span className="item-title">Gérer les catégories</span>
                    <span className="item-emoji">✏️</span>
                </div>
                <div className="item" onClick={async () => {await router.push("/upload")}}>
                    <span className="item-title">Uploader des photos</span>
                    <span className="item-emoji">📷</span>
                </div>
                <div className="item" onClick={async () => {await router.push("/join")}}>
                    <span className="item-title">Rejoindre une partie</span>
                    <span className="item-emoji">🎮</span>
                </div>
            </main>
        </>)
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)