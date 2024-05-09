import {Button} from "primereact/button"
import PlayerCard from "@/components/PlayerCard"
import {socket} from "../../utils/socket"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"
import {useEffect, useState} from "react"

export default function Game(props) {
    const [gameData, setGameData] = useState(props.gameData)
    const [index, setIndex] = useState(0)
    const [questionMode, setQuestionMode] = useState(true)
    const [propositionChecked, setPropositionChecked] = useState(null)
    const [preventValidation, setPreventValidation] = useState(false)
    const [rendered, setRendered] = useState(false)
    const router = useRouter()
    const isMobile = useMediaQuery({maxWidth: 768})

    useEffect(() => {
        if (!rendered) {
            socket.emit("userHasJoinedGame", {game: props.game})
            setRendered(true)
        }

        socket.on("changePhoto", async () => {
            setIndex(index + 1)
            setPropositionChecked(null)
            setPreventValidation(false)
        })

        socket.on("getSolution", async () => {
            const request = await fetch("/api/game/getSolution", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: props.user.id, accessCode: props.accessCode}),
            })

            if (request.status === 200) {
                const data = await request.json()
                setGameData(data.content)
                setIndex(0)
                setQuestionMode(false)
            }
        })

        socket.on("getScores", async () => {
            await router.push({
                pathname: "/scores", query: {accessCode: props.accessCode},
            }, "/scores")
        })
    }, [index])

    const handleValidation = async () => {
        if (questionMode) {
            setPreventValidation(true)

            const request = await fetch("/api/response/addResponse", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: props.user.id, accessCode: props.accessCode, photo: gameData.photos[index].id, response: propositionChecked}),
            })

            if (request.status === 200) {
                const data = await request.json()

                if(data.content.responsesCount >= data.content.participantsCount) {
                    if (index === gameData.photos.length - 1) {
                        socket.emit("getSolution", {game: props.game})
                    } else {
                        socket.emit("changePhoto", {game: props.game})
                    }
                }
            }
        } else {
            if (index === gameData.photos.length - 1) {
                socket.emit("getScores", {game: props.game})
            } else {
                socket.emit("changePhoto", {game: props.game})
            }
        }
    }

    return (
        <main id="game">
            <h1>{gameData.photos[index].category}</h1>

            <div id="container">
                <section id="photo-container">
                    <img src={gameData.photos[index].link} alt="Photo"/>
                </section>

                <section id="propositions-container">
                    <div id="propositions">
                        {questionMode ?
                            gameData.propositions.map(proposition =>
                                <div key={proposition.id} className={`playercard_container${!preventValidation ? " hover" : ""}${propositionChecked === proposition.id ? " checked" : ""}`} onClick={() => !preventValidation && setPropositionChecked(proposition.id)}>
                                    <PlayerCard user={proposition} isMobile={isMobile} />
                                </div>
                            )
                            :
                            <div id="solution-container">
                                <div className="solution-wrapper">
                                    <span className="label">Tu as sélectionné :</span>
                                    <div className="playercard_container" style={{color: gameData.photos[index].response.id === gameData.photos[index].solution.id ? "#188a42" : "#d9342b"}}>
                                        <PlayerCard user={gameData.photos[index].response} isMobile={isMobile} />
                                    </div>
                                </div>

                                <div className="solution-wrapper">
                                    <span className="label">Et la bonne réponse est :</span>
                                    <div className="playercard_container">
                                        <PlayerCard user={gameData.photos[index].solution} isMobile={isMobile} />
                                    </div>
                                </div>
                            </div>
                        }
                    </div>

                    {questionMode ?
                        <div id="validate-container">
                            <Button label={preventValidation ? "En attente des autres joueurs..." : "Valider"} disabled={preventValidation || propositionChecked === null} onClick={handleValidation} rounded/>
                        </div>
                        :
                        props.game.owner === props.user.id &&
                            <div id="validate-container">
                                <Button label={index === gameData.photos.length - 1 ? "Voir les scores" : "Photo suivante"} onClick={handleValidation} rounded/>
                            </div>
                    }
                </section>
            </div>
        </main>
    )
}