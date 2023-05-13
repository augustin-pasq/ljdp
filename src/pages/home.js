import React from 'react';
import {Card} from "primereact/card"
import {withSessionSsr} from "../../lib/ironSession";
import {useRouter} from "next/router";

export default function Home(props) {
    const router = useRouter()

    const navigateNewGame = async () => {
        const game = await (await fetch('/api/game/createGame', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(props),
        })).json()

        await router.push({
            pathname: '/game/edit',
            query: {accessCode: game.content.accessCode},
        }, '/game/edit');
    };

    const navigateUpload = async () => { await router.push('/upload') };

    return (
        <div className="grid">
            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-end scale-in-br scale-in-center-1">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center" onClick={navigateNewGame}>
                    <h1 className="text-4xl text-center">Nouvelle partie</h1>
                    <span className="text-4xl">🚀</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-start scale-in-bl scale-in-center-2">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center" onClick={navigateUpload}>
                    <h1 className="text-4xl text-center">Uploader des photos</h1>
                    <span className="text-4xl">📷</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-end scale-in-tr scale-in-center-3">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center">
                    <h1 className="text-4xl text-center">Mes parties</h1>
                    <span className="text-4xl">🏆</span>
                </Card>
            </div>

            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-start scale-in-tl scale-in-center-4">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center">
                    <h1 className="text-4xl text-center">Mon compte</h1>
                    <span className="text-4xl">🕵️</span>
                </Card>
            </div>
        </div>)
}

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req}) {
    let user = req.session.user;

    if (!user?.isLoggedIn) {
        return {
            redirect: {
                permanent: false, destination: '/login'
            }
        }
    }

    return {
        props: {
            owner: req.session.user.id
        }
    }
})