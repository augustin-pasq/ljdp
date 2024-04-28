import AccessCodeForm from "@/components/AccessCodeForm"
import Dashboard from "@/components/Dashboard"
import Game from "@/components/Game"
import {useEffect, useState} from "react"
import {useRouter} from "next/router"

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])
    const [formText, setFormText] = useState({})
    const [gameData, setGameData] = useState([])
    const [participants, setParticipants] = useState([])
    const [rendered, setRendered] = useState(false)
    const [scores, setScores] = useState([])
    const router = useRouter()

    useEffect(() => {
        if (props.accessCode !== undefined) {
            switch(router.pathname) {
                case "/edit":
                    getCategories()
                        .then((result) => { setCategories(result) })
                        .then(() => setFormText({
                            subtitle: "Entre ici le code de la partie que tu veux éditer :",
                            button: "Éditer la partie"
                        }))
                        .then(() => setRendered(true))
                    break
                case "/upload":
                    getCategories()
                        .then((result) => { setCategories(result) })
                        .then(() => setFormText({
                            subtitle: "Entre ici le code qu'on t'a envoyé pour uploader tes photos :",
                            button: "Uploader mes photos"
                        }))
                        .then(() => setRendered(true))
                    break
                case "/join":
                    getCategories()
                        .then((result) => { setCategories(result) })
                        .then(() => {
                            getParticipants()
                                .then((result) => setParticipants(result.content))
                                .then(() => setFormText({
                                    subtitle: "Entre ici le code qu'on t'a envoyé pour rejoindre tes amis :",
                                    button: "Rejoindre mes amis"
                                }))
                                .then(() => setRendered(true))
                        })
                    break
                case "/play":
                    getGameData()
                        .then((result) => setGameData(result))
                        .then(() => setFormText({
                            subtitle: "Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :",
                            button: "Jouer avec mes amis"
                        }))
                        .then(() => setRendered(true))
                    break
                case "/scores":
                    getScores()
                        .then((result) => { setScores(result) })
                        .then(() => {
                            getCategories()
                                .then((result) => { setCategories(result) })
                                .then(() => setFormText({
                                    subtitle: "Entre ici le code de la partie dont tu veux consulter les scores :",
                                    button: "Consulter les scores"
                                }))
                                .then(() => setRendered(true))
                        })
            }
        }
    }, [props.accessCode])

    async function getCategories() {
        const request = await fetch("/api/category/getCategories", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode, user: props.user.id}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

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

    async function getScores() {
        const request = await fetch("/api/participant/getScores", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    return (
        <>
            {props.accessCode !== undefined && rendered ?
                {
                    "/edit":     <Dashboard accessCode={props.accessCode} categories={categories} user={props.user} page={router.pathname}/>,
                    "/upload":   <Dashboard accessCode={props.accessCode} categories={categories} user={props.user} page={router.pathname}/>,
                    "/join":     <Dashboard accessCode={props.accessCode} categories={categories} user={props.user} page={router.pathname} gameOwner={parseInt(props.gameOwner)} participants={participants}/>,
                    "/play":     <Game accessCode={props.accessCode} user={props.user} gameData={gameData} gameOwner={parseInt(props.gameOwner)}/>,
                    "/scores":   <Dashboard accessCode={props.accessCode} categories={categories} user={props.user} page={router.pathname} scores={scores}/>
                }[router.pathname]
                :
                <AccessCodeForm subtitle={formText.subtitle} button={formText.button} redirect={router.pathname} user={props.user}/>
            }
        </>
    )
}