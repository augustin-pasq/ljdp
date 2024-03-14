import React, {useEffect, useState} from "react"
import Game from "@/components/Game"
import GameLauncher from "@/components/GameLauncher"
import {io} from "socket.io-client"

const socket = io.connect("http://localhost:4000")

export default function GameDispatcher(props) {
    const [gameMode, setGameMode] = useState("awaitingPlayers")
    const [gameData, setGameData] = useState([])

    useEffect(() => {
        socket.on("gameModeHasChanged", (gameMode) => {
            getGameData()
                .then((result) => setGameData(result))
                .then(() => setGameMode(gameMode))
                .catch(error => console.error(error))
        })
    }, [])

    const getGameData = async () => {
        const request = await fetch("/api/game/getGameData", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    const setGameModeHandler = (gameMode) => {
        socket.emit("setGameMode", {accessCode: props.accessCode, gameMode: gameMode})
    }

    return (
        <>
            {
                gameMode === "awaitingPlayers" && <GameLauncher accessCode={props.accessCode} categories={props.categories} user={props.user} gameOwner={props.gameOwner} setGameModeHandler={setGameModeHandler}/> ||
                gameMode === "gameStarted" && <Game accessCode={props.accessCode} user={props.user.id} gameData={gameData} />
            }
        </>
    )
}