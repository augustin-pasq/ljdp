import GameEditor from "@/components/Editor/GameEditor"
import React, {useEffect, useRef, useState} from "react"
import AccessCodeForm from "@/components/AccessCode/AccessCodeForm"
import Uploader from "@/components/Uploader/Uploader"
import {Toast} from "primereact/toast"
import GameContainer from "@/components/Game/GameContainer";
import GameScores from "@/components/Game/GameScores";

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])
    const [scores, setScores] = useState([])
    const [readyToRender, setReadyToRender] = useState(false)
    const toastErr = useRef(null)

    useEffect(() => {
        async function getCategories() {
            const results = await fetch("/api/category/getCategories", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: props.accessCode, user: props.user}),
            })

            switch(results.status) {
                case 200:
                    return await results.json()
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        }

        async function getScores() {
            const results = await fetch("/api/participant/getScores", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: props.accessCode}),
            })

            switch(results.status) {
                case 200:
                    return await results.json()
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        }

        if (props.accessCode !== undefined) {
            if(props.action === "scores") {
                getScores()
                    .then((content) => { setScores(content) })
                    .then(() => {
                        getCategories()
                            .then((content) => { setCategories(content) })
                            .catch(error => console.error(error))
                    })
                    .then(() => setReadyToRender(true))
                    .catch(error => console.error(error))

            } else {
                getCategories()
                    .then((content) => { setCategories(content) })
                    .then(() => setReadyToRender(true))
                    .catch(error => console.error(error))
            }
        }
    }, [props.accessCode])

    return (
        <>
            {props.accessCode !== undefined && readyToRender ?
                {
                    "edit":     <GameEditor accessCode={props.accessCode} categories={categories}/>,
                    "upload":   <Uploader accessCode={props.accessCode} categories={categories} user={props.user}/>,
                    "play":     <GameContainer accessCode={props.accessCode} gameOwner={parseInt(props.gameOwner)} categories={categories} user={props.user}/>,
                    "scores":   <GameScores accessCode={props.accessCode} categories={categories} scores={scores} user={props.user}/>
                }[props.action]
                :
                <AccessCodeForm subtitle={props.subtitle} button={props.button} redirect={props.redirect} action={props.action} user={props.user}/>
            }
            <Toast ref={toastErr} />
        </>
    );

}