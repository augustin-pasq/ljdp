import {Button} from "primereact/button"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import Game from "@/components/Game"
import {InputText} from "primereact/inputtext"
import Navbar from "@/components/Navbar"
import PlayerCard from "@/components/PlayerCard"
import {Skeleton} from "primereact/skeleton"
import {socket} from "../../../utils/socket"
import {Toast} from "primereact/toast"
import {useEffect, useRef, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

export default function Play(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const mediaQueryMedium = useMediaQuery({minWidth: 768, maxWidth: 1200})
    const toast = useRef(null)
    const router = useRouter()
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [categories, setCategories] = useState(null)
    const [game, setGame] = useState(null)
    const [gameData, setGameData] = useState(null)
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    const [participants, setParticipants] = useState(null)
    const [rendered, setRendered] = useState(false)

    useEffect(() => {
        setIsMobile(mediaQuery)
        setIsTablet(mediaQueryMedium)

        if (!rendered) {
            socket.emit("userHasJoined", {game: parseInt(router.query.id), user: props.user})

            getCategories(parseInt(router.query.id))
                .then(result => {
                    setGame(result.game)
                    setCategories(result.categories)

                    if(result.game.status === "started") {
                        getGameData(result.game)
                            .then((result) => {
                                setGameData(result)
                                setIsGameStarted(true)
                            })
                    }

                    setRendered(true)
                })
        }

        socket.on("userHasJoined", (data) => {
            setParticipants(data)
        })

        socket.on("launchGame", async (data) => {
            getGameData(data)
                .then((result) => {
                    setGameData(result)
                    setIsGameStarted(true)
                })
        })
    }, [mediaQuery, mediaQueryMedium, participants])

    const handleLaunch = async () => {
        const request = await fetch("/api/photo/countPhotos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({game: game.id}),
        })

        if (request.status === 200) {
            const data = await request.json()

            if (data.content > 0) {
                socket.emit("launchGame", {game: game})
            } else {
                toast.current.show({severity: "error", summary: "Impossible de lancer la partie", detail: "Aucun jouer n'a uploadé de photo !", life: 3000})
            }
        }
    }

    const getGameData = async (game) => {
        const request = await fetch("/api/game/getGameData", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({game: game.id}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    const categoriesSection = (width) => {
        return(
            <section className="list-container" style={{width: width}}>
                <span className="section-header">Catégories</span>
                <Categories categories={categories} page="play" />
            </section>
        )
    }

    const playersSection = (width) => {
        return(
            <section className="players-container" style={{width: width}}>
                <span className="section-header">Participants</span>
                <ul>
                    {participants !== null ?
                        participants.map(participant => {
                            return (
                                <li key={participant.User.id} className={`playercard_container ${participant.hasJoined ? "background-white" : "background-dark"}`}>
                                    <PlayerCard user={participant.User} isMobile={isMobile} icon={participant.hasPhotos ? "pi-images" : ""} />
                                </li>
                            )
                        })
                        :
                        <>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                        </>
                    }
                </ul>
            </section>
        )
    }

    return (isGameStarted ?
        <Game user={props.user} game={game} gameData={gameData} />
        :
        <>
            <Navbar user={props.user} isMobile={isMobile}/>
            <main id="dashboard">
                <h1 id="page-title">Rejoindre une partie</h1>

                <div id="container" style={{flexDirection: isMobile ? "column" : "row"}}>
                    <section id="instructions-container" style={{width: isTablet ? "45%" : "32%"}}>
                        <div className="side-container">
                            <span id="title">Voici le code d'accès de la partie :</span>
                            <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={game !== null ? game.accessCode : ""} onClick={() => {navigator.clipboard.writeText(`${props.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                            <div id="links-container">
                                <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                                <span><a href={`https://ljdp.augustinpasquier.fr/play/${game !== null ? game.id : ""}`} target="_blank">{`ljdp.augustinpasquier.fr/play/${game !== null ? game.id : ""}`}</a> pour commencer la partie</span>
                                <small>(Les joueurs n'ayant pas envoyé de photos peuvent quand même participer.)</small>
                            </div>
                        </div>

                        {(game !== null && game.owner === props.user.id) &&
                            <div className="side-down-container">
                                <Button label="Lancer la partie" rounded onClick={handleLaunch}/>
                            </div>
                        }
                    </section>

                    {isTablet ?
                        <div id="sections-wrapper" style={{width: "55%"}}>
                            {categoriesSection("100%")}
                            {playersSection("100%")}
                        </div>
                        :
                        <>
                            {categoriesSection("40%")}
                            {playersSection("28%")}
                        </>
                    }
                </div>
            </main>
            <Toast ref={toast} />
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)