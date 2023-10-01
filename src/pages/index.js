import {Card} from "primereact/card"
import {Button} from "primereact/button"
import Link from "next/link"

export default function Index() {
    return (
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