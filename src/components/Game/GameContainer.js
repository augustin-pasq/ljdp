import React, {useEffect, useRef, useState} from "react"
import Game from "@/components/Game/Game"
import GameLauncher from "@/components/Game/GameLauncher"
import {io} from "socket.io-client"
import {Toast} from "primereact/toast"

const socket = io.connect("http://localhost:4000")

export default function GameContainer(props) {
    const [gameMode, setGameMode] = useState("awaitingPlayers")
    const [gameData, setGameData] = useState([])
    const toastErr = useRef(null)

    useEffect(() => {
        socket.on("gameModeHasChanged", (gameMode) => {
            getGameData()
                .then((content) => setGameData(content))
                .then(() => setGameMode(gameMode))
                .catch(error => console.error(error))
        })
    }, [])

    const getGameData = async () => {
        const results = await fetch("/api/game/getGameData", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode}),
        })

        switch (results.status) {
            case 200:
                return await results.json()
            case 500:
                toastErr.current.show({severity: "error", summary: "Erreur", detail: "Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                break
        }
    }

    const setGameModeHandler = (gameMode) => {
        socket.emit("setGameMode", {accessCode: props.accessCode, gameMode: gameMode})
    }

    return (
        <>
            {
                gameMode === "awaitingPlayers" && <GameLauncher accessCode={props.accessCode} user={props.user} gameOwner={props.gameOwner} setGameModeHandler={setGameModeHandler}/> ||
                gameMode === "gameStarted" && <Game accessCode={props.accessCode} user={props.user} gameData={gameData} />
            }

            <Toast ref={toastErr}/>
        </>
    )
}