import React, {useEffect, useState} from "react"
import {io} from "socket.io-client"
import Navbar from "@/components/Navbar";

const socket = io.connect("http://localhost:4000")

export default function GameLauncher(props) {
    const [participants, setParticipants] = useState([])
    const [players, setPlayers] = useState([])

    useEffect(() => {
        socket.on("userHasJoined", (data) => {
            setPlayers([...players, {id: data.user.id, user: data.user}])
        })

        getParticipants().then(result => setParticipants(result.content))
    }, [])

    const getParticipants = async () => {
        const request = await fetch("/api/participant/getParticipants", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode}),
        })

        return request.status === 200 ? await request.json() : []
    }

    const handleJoin = async () => {
        const request = await fetch("/api/participant/setHasJoined", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user.id, accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            socket.emit("setHasJoined", data.content)
        }
    }

    const handleStart = async () => {
        await handleJoin()
        props.setGameModeHandler("gameStarted")
    }

    // TODO :
    //  - consignes (col droite 1)
    //  - liste des joueurs ayant envoyé des photos (col gauche 2)
    //  - liste des joueurs ayant rejoint (col droite 2)
    //  - bouton pour rejoindre (col droite 3)

    return (
        <>
            <Navbar user={props.user}/>
            <main id="gamelauncher">
                <h1>Rejoindre une partie</h1>

                <div id="container">
                    <section id="game-informations">
                        <li id="categories-list">
                            {props.categories.map(category => {
                                return (
                                    <ul key={category.id}>
                                        <span className="category-title">{category.title}</span>
                                    </ul>
                                )
                            })}
                        </li>
                    </section>

                    <section id="participants-informations">
                        <li id="participants-list">
                            {participants.map(participant => {
                                return (
                                    <ul key={participant.id}>
                                        <span className="category-title">{participant.User.displayedName}</span>
                                    </ul>
                                )
                            })}
                        </li>
                    </section>

                    <section id="game-instructions">
                        <div id="instructions">

                        </div>

                        <div id="join-button" onClick={handleStart}>

                        </div>
                    </section>
                </div>
            </main>
        </>
    )
}