import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import {useRouter} from "next/router"
import {Card} from "primereact/card"
import {Button} from "primereact/button"
import Link from "next/link"
import Home from "@/components/Home";

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
            <Home user={props.user} />
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