import {checkIfUserIsLoggedIn, withSessionSsr} from "../../utils/ironSession"
import {Card} from "primereact/card"
import {Button} from "primereact/button"
import Link from "next/link"
import Home from "@/components/Home";

export default function Index(props) {
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