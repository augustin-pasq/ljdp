import GameEditor from "@/components/Editor/GameEditor"
import React, {useEffect, useRef, useState} from "react"
import AccessCodeForm from "@/components/AccessCode/AccessCodeForm"
import Uploader from "@/components/Uploader/Uploader"
import {Toast} from "primereact/toast"
import GameContainer from "@/components/Game/GameContainer";

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])
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

        if (props.accessCode !== undefined) {
            getCategories()
                .then((content) => { setCategories(content) })
                .then(() => setReadyToRender(true))
                .catch(error => console.error(error))
        }
    }, [props.accessCode])

    return (
        <>
            {props.accessCode === undefined ?
                <AccessCodeForm subtitle={props.subtitle} button={props.button} redirect={props.redirect} action={props.action} user={props.user}/>
                :
                readyToRender && (
                    <>
                        {props.action === "edit" && <GameEditor accessCode={props.accessCode} categories={categories}/>}
                        {props.action === "upload" && <Uploader accessCode={props.accessCode} categories={categories} user={props.user}/>}
                        {props.action === "play" && <GameContainer accessCode={props.accessCode} gameOwner={parseInt(props.gameOwner)} categories={categories} user={props.user}/>}
                    </>
                )
            }
            <Toast ref={toastErr} />
        </>
    );

}