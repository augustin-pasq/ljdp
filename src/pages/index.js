import {Card} from "primereact/card";
import {Button} from "primereact/button";
import Link from "next/link";

export default function Home() {
    return (
        <Card title="LJDP : Le Jeu Des Photos">
            <Link href="/login">
                <Button size="large" rounded outlined>Connexion</Button>
            </Link>
            <Link href="/register">
                <Button size="large" rounded outlined>Inscription</Button>
            </Link>
        </Card>
    )
}