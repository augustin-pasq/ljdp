import React, {useEffect, useState} from "react"
import {io} from "socket.io-client"
import Navbar from "@/components/Navbar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {Avatar} from "primereact/avatar";

const socket = io.connect("http://192.168.1.12:4000")

export default function GameLauncher(props) {
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [players, setPlayers] = useState(props.participants.filter(participant => participant.hasJoined).map(participant => participant.User))
    const [hasJoined, setHasJoined] = useState(false)

    useEffect(() => {
        socket.on("userHasJoined", (data) => {
            setPlayers([...players, data.user])
        })
    }, [players])


    const handleJoin = async () => {
        const request = await fetch("/api/participant/setHasJoined", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user.id, accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            socket.emit("setHasJoined", data.content)
            setHasJoined(true)
        }
    }

    const handleStart = async () => {
        await handleJoin()
        props.setGameModeHandler("gameStarted")
    }

    return (
        <>
            <Navbar user={props.user}/>
            <main id="gamemaker">
                <h1>Rejoindre une partie</h1>

                <div id="container" /*style={{flexDirection: "column"}}*/>
                    <section id="instructions-container" style={{width: "31%"}}>
                        <div className="side-container">
                            <span id="title">Voici le code d'accès de la partie :</span>
                            <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={props.accessCode} onClick={() => {navigator.clipboard.writeText(`${props.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                            <div id="links-container">
                                <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                                <span><a href="https://ljdp.augustinpasquier.fr/play" target="_blank">ljdp.augustinpasquier.fr/play</a> pour commencer la partie</span>
                                <small>(Les joueurs n'ayant pas envoyé de photos peuvent quand même participer.)</small>
                            </div>
                        </div>

                        <div className="side-down-container">
                            <Button label={hasJoined ? "En attente du lancement de la partie..." : props.gameOwner === props.user.id ? "Lancer la partie" : "Rejoindre"} rounded disabled={hasJoined} onClick={props.gameOwner === props.user.id ? handleStart : handleJoin}/>
                        </div>
                    </section>


                    <section className="list-container" style={{width: "47%"}}>
                        <span className="header">Catégories</span>
                        <li>
                            {props.categories.map(category => {
                                return (
                                    <ul key={category.id}>
                                        <span className="title">{category.title}</span>
                                    </ul>
                                )
                            })}
                        </li>
                    </section>

                    <section className="list-container" style={{width: "22%"}}>
                        <span className="header">Participants</span>
                        <li>
                            {props.participants.map(participant => {
                                return (
                                    <ul key={participant.User.id} className={`participant ${players.find(player => player.id === participant.User.id) !== undefined ? "background-white" : "background-dark"}`}>
                                        <Avatar image={participant.User.profilePicture} size="large" shape="circle"/>
                                        <div className="username-wrapper">
                                            <span className="username">{participant.User.username}</span>
                                            <span>{participant.User.displayedName}</span>
                                        </div>
                                    </ul>
                                )
                            })}
                        </li>
                    </section>
                </div>
            </main>
        </>)
}