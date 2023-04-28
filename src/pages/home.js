import React from 'react';
import {useRouter} from "next/router";
import {Card} from "primereact/card"

export default function Home() {
    const router = useRouter()

    const navigateNewGame = async () => { await router.push('/create'); };

    return (
        <div className="grid">
            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-end scale-in-br scale-in-center-1">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center " onClick={navigateNewGame}>
                    <h1 className="text-4xl text-center">Nouvelle partie</h1>
                    <span className="text-4xl">🚀</span>
                </Card>
            </div>
            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-start scale-in-bl scale-in-center-2">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center">
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
        </div>
    )
}