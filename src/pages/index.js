import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import Navbar from "@/components/Navbar"
import {useRouter} from "next/router"
import {Card} from "primereact/card"
import {Button} from "primereact/button"
import Link from "next/link"

export default function Index(props) {
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
        props.user !== null ?
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
            </>
        :
            <Card title="LJDP : Le Jeu Des Photos">
                <Link href="/login">
                    <Button label="Connexion" size="large" rounded outlined/>
                </Link>
                <Link href="/register">
                    <Button label="Inscription" size="large" rounded outlined/>
                </Link>
            </Card>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)