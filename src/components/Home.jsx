import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import {Toast} from "primereact/toast"
import {useFormik} from "formik"
import {useEffect, useRef, useState} from "react"
import {useRouter} from "next/router"
import {useMediaQuery} from "react-responsive"
import {Avatar} from "primereact/avatar"
import {Tag} from "primereact/tag"
import {Skeleton} from "primereact/skeleton"

export default function Home(props) {
    const mediaQuery = useMediaQuery({maxWidth: 855})
    const [games, setGames] = useState(null)
    const toast = useRef(null)
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(true)

    useEffect(() => {
        setIsMobile(mediaQuery)
        getGames().then((result) => setGames(result))

        if (router.query.message !== null) {
            switch (router.query.message) {
                case "not_found":
                    toast.current.show({severity: "error", detail:"Aucune partie n'existe pour ce code."})
                    break
                case "unauthorized":
                    toast.current.show({severity: "error", detail:"Tu ne peux pas gérer les catégories d'une partie que tu n'as pas créée."})
                    break
                case "ended":
                    toast.current.show({severity: "error", detail:"Tu ne peux pas accéder à une partie terminée, désolé !"})
                    break
                case "started":
                    toast.current.show({severity: "error", detail:"La partie a déjà commencé, il fallait être plus rapide !"})
                    break
                case "not_joined":
                    toast.current.show({severity: "error", detail:"Tu ne peux pas jouer à une partie que tu n'as pas rejointe."})
                    break
            }
        }
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

    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validate: (data) => {
            let errors = {}
            if (!data.code || /^\s*$/.test(data.code)) errors.code = "Requis."
            else if (!data.code || !/^[a-zA-Z0-9]{4}$/.test(data.code)) errors.code = "Le code doit comporter 4 caractères et uniquement des lettres et des chiffres."
            return errors
        },
        onSubmit: async (data) => {
            const request = await fetch("/api/participant/addParticipant", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: data.code, user: props.user.id}),
            })

            if (request.status === 200) {
                const data = await request.json()
                switch(data.content.message) {
                    case "added":
                        getGames().then((result) => setGames(result))
                        toast.current.show({severity: "success", detail: "La partie a été ajoutée à ton compte !"})
                        break
                    case "already_added":
                        toast.current.show({severity: "error", detail: "Tu as déjà ajouté cette partie à ton compte."})
                        break
                    case "bad_status":
                        toast.current.show({severity: "error", detail: "Tu ne peux pas ajouter une partie commencée ou terminée."})
                        break
                    case "no_game":
                        toast.current.show({severity: "error", detail: "Aucune partie n'a été trouvée pour ce code."})
                        break
                }
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const navigateNewGame = async () => {
        const request = await fetch("/api/game/addGame", {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        })

        if(request.status === 200) {
            const data = await request.json()
            await router.push({pathname: `/edit/${data.content.id}`, query: {displayToast: true}}, `/edit/${data.content.id}`)
        }
    }

    return(
        <>
            <Navbar user={props.user} isMobile={isMobile} />
            <main id="home">
                <h2 id="page-title">Jouer à LJDP</h2>

                <div id="home-items">
                    <div className="item">
                        <span className="title">🚀 Créer une partie</span>
                        <p className="description">Crée une partie, ajoute des catégories et invite tes amis !</p>
                        <Button label="Commencer" rounded onClick={navigateNewGame} />
                    </div>
                    <div className="item">
                        <span className="title">🚪 Rejoindre une partie</span>
                        <p className="description">Entre un code d'accès pour ajouter une partie à ton compte :</p>

                        <form onSubmit={formik.handleSubmit}>
                            <div id="input-wrapper">
                                <InputText id="code" className={isFormFieldInvalid("code") ? "p-invalid" : ""} name="code" maxLength={4} value={formik.values.code} onChange={(e) => {formik.setFieldValue("code", e.target.value.toUpperCase())}} />
                                <Button icon="pi pi-arrow-right" type="submit" rounded/>
                            </div>
                        </form>
                    </div>
                </div>

                {games !== null && games.length > 0 && <h2 id="page-title">Mes parties</h2>}

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
            <Toast ref={toast} position="bottom-center" />
        </>
    )
}