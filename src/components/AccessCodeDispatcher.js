import AccessCodeForm from "@/components/AccessCodeForm"
import GameDispatcher from "@/components/GameDispatcher"
import GameMaker from "@/components/GameMaker"
import GameScores from "@/components/GameScores"
import React, {useEffect, useState} from "react"

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])
    const [scores, setScores] = useState([])

    useEffect(() => {
        async function getCategories() {
            const request = await fetch("/api/category/getCategories", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: props.accessCode, user: props.user.id}),
            })

            if(request.status === 200) {
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

        if (props.accessCode !== undefined) {
            if(props.action === "scores") {
                getScores()
                    .then((result) => { setScores(result) })
                    .then(() => {
                        getCategories()
                            .then((result) => { setCategories(result) })
                            .catch(error => console.error(error))
                    })
                    .catch(error => console.error(error))

            } else {
                getCategories()
                    .then((result) => { setCategories(result) })
                    .catch(error => console.error(error))
            }
        }
    }, [props.accessCode])

    return (
        <>
            {props.accessCode !== undefined ?
                {
                    "edit":     <GameMaker accessCode={props.accessCode} categories={categories} user={props.user} action={props.action}/>,
                    "upload":   <GameMaker accessCode={props.accessCode} categories={categories} user={props.user} action={props.action}/>,
                    "play":     <GameDispatcher accessCode={props.accessCode} gameOwner={parseInt(props.gameOwner)} categories={categories} user={props.user}/>,
                    "scores":   <GameScores accessCode={props.accessCode} categories={categories} scores={scores} user={props.user}/>
                }[props.action]
                :
                <AccessCodeForm subtitle={props.subtitle} button={props.button} redirect={props.redirect} action={props.action} user={props.user}/>
            }
        </>
    )
}