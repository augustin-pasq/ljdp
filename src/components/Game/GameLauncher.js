import {Card} from "primereact/card"
import React, {useEffect, useRef, useState} from "react"
import {Toast} from "primereact/toast"
import {io} from "socket.io-client"
import {Chip} from "primereact/chip"

const socket = io.connect("http://localhost:4000")

export default function GameLauncher(props) {
    const toastErr = useRef(null)
    const [players, setPlayers] = useState([])

    useEffect(() => {
        socket.on("userHasJoined", (data) => {
            setPlayers([...players, {id: data.user.id, user: data.user}])
        })
    }, [])

    const handleJoin = async () => {
        const results = await fetch("/api/participant/setHasJoined", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user, accessCode: props.accessCode}),
        })

        switch (results.status) {
            case 200:
                const content = await results.json()
                socket.emit("setHasJoined", content)
                break
            case 500:
                toastErr.current.show({severity: "error", summary: "Erreur", detail: "Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                break
        }
    }

    const handleStart = async () => {
        await handleJoin()
        props.setGameModeHandler("gameStarted")
    }

    return (
        <>
            {props.gameOwner === props.user ?
                <div className="col-12 p-3 flex justify-content-center">
                    <Card className="card-home flex square border-round-4xl md:w-16rem justify-content-center align-items-center text-center" onClick={handleStart}>
                        <h1 className="text-4xl text-center">Lancer la partie</h1>
                        <span className="text-4xl">▶️️</span>
                    </Card>
                </div>
                :
                <div className="col-12 p-3 flex justify-content-center">
                    <Card className="card-home flex square border-round-4xl md:w-16rem justify-content-center align-items-center text-center" onClick={handleJoin}>
                        <h1 className="text-4xl text-center">Rejoindre la partie</h1>
                        <span className="text-4xl">🎮️</span>
                    </Card>
                </div>
            }

            <div className="pt-3 flex flex-wrap justify-content-center">
                {players.map((player, index) => {
                    return(
                        <Chip key={index} className="m-2" label={player.user.displayedName} image={player.user.profilePicture} />
                    )
                })}
            </div>

            <Toast ref={toastErr}/>
        </>
    )
}