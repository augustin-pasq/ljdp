import React, {useEffect, useState} from "react"
import Game from "@/components/Game"
import {io} from "socket.io-client"
import Dashboard from "@/components/Dashboard";

const socket = io.connect("http://192.168.1.12:4000")

export default function GameDispatcher(props) {
    const [gameMode, setGameMode] = useState("awaitingPlayers")
    const [gameData, setGameData] = useState([])
    const [participants, setParticipants] = useState([])
    const [rendered, setRendered] = useState(false)

    useEffect(() => {
        getParticipants()
            .then((result) => setParticipants(result.content))
            .then(() => setRendered(true))

        socket.on("gameModeHasChanged", (gameMode) => {
            getGameData()
                .then((result) => setGameData(result))
                .then(() => setGameMode(gameMode))
        })
    }, [])

    const getParticipants = async () => {
        const request = await fetch("/api/participant/getParticipants", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode}),
        })

        return request.status === 200 ? await request.json() : []
    }

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
            {rendered &&
                gameMode === "awaitingPlayers" && <Dashboard accessCode={props.accessCode} categories={props.categories} user={props.user} gameOwner={props.gameOwner} participants={participants} setGameModeHandler={setGameModeHandler} action="play"/> ||
                gameMode === "gameStarted" && <Game accessCode={props.accessCode} user={props.user.id} gameData={gameData} />
            }
        </>
    )
}