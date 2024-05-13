import {Avatar} from "primereact/avatar"
import {Button} from "primereact/button"
import Link from "next/link"
import {Tag} from "primereact/tag"
import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../utils/ironSession";
import Navbar from "@/components/Navbar";
import {Skeleton} from "primereact/skeleton";

export default function Games(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const [games, setGames] = useState(null)
    const [isMobile, setIsMobile] = useState(true)

    useEffect(() => {
        setIsMobile(mediaQuery)
        getGames().then((result) => setGames(result))
    }, [mediaQuery])

    const getGames = async() => {
        const request = await fetch("/api/participant/getGames", {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        })

        if(request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    return (
        <>
            <Navbar user={props.user} isMobile={isMobile} />
            <main id="games">
                <h1 id="page-title">Liste des parties</h1>

                <ul id="games-list">
                    {games !== null ?
                        games.map(game => {
                        return (
                            <li key={game.Game.id} className="game-item">
                                <div className="data">
                                    <Avatar image={game.Game.User.profilePicture} size={isMobile ? "large" : "xlarge"} shape="circle" />
                                    <Tag value={game.Game.accessCode} rounded />
                                    <div className="details">
                                        <span className="title">{`Partie de ${game.Game.User.username}`}</span>
                                        <small className="date">{`Rejointe le ${(new Date(game.createdAt)).toLocaleString("fr-FR", {year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"})}`}</small>
                                    </div>
                                </div>
                                <div className="actions">
                                    {(props.user.id === game.Game.User.id && game.Game.status === "created") &&
                                        <Link href={`/edit/${game.Game.id}`}>
                                            <Button label={isMobile ? "" : "Éditer"} icon="pi pi-pencil" rounded outlined />
                                        </Link>
                                    }
                                    {game.Game.status === "created" &&
                                        <Link href={`/upload/${game.Game.id}`}>
                                            <Button label={isMobile ? "" : "Uploader"} icon="pi pi-images" rounded outlined />
                                        </Link>
                                    }
                                    {game.Game.status === "created" &&
                                        <Link href={`/play/${game.Game.id}`}>
                                            <Button label={isMobile ? "" : "Jouer"} icon="pi pi-play" rounded outlined />
                                        </Link>
                                    }
                                    {game.Game.status === "ended" &&
                                        <Link href={`/scores/${game.Game.id}`}>
                                            <Button label={isMobile ? "" : "Scores"} icon="pi pi-chart-bar" rounded outlined />
                                        </Link>
                                    }
                                </div>
                            </li>
                        )
                    })
                    :
                        <>
                            <Skeleton height={isMobile ? "9rem" : "6rem"} borderRadius="1rem"></Skeleton>
                            <Skeleton height={isMobile ? "9rem" : "6rem"} borderRadius="1rem"></Skeleton>
                            <Skeleton height={isMobile ? "9rem" : "6rem"} borderRadius="1rem"></Skeleton>
                        </>
                    }
                </ul>
            </main>
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)