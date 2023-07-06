import GameEditor from "@/pages/Components/GameEditor"
import React, {useState, useEffect, useRef} from "react"
import AccessCodeForm from "@/pages/Components/AccessCodeForm"
import Uploader from "@/pages/Components/Uploader"
import {Toast} from "primereact/toast"

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])
    const toastErr = useRef(null)

    useEffect(() => {
        async function getCategories() {
            const results = await fetch('/api/category/getCategories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({accessCode: props.accessCode}),
            })

            switch(results.status) {
                case 200:
                    return await results.json()
                case 500:
                    toastErr.current.show({severity:'error', summary: 'Erreur', detail:'Une erreur s\'est produite. Réessaye pour voir ?', life: 3000})
                    break
            }
        }

        getCategories()
            .then((content) => { setCategories(content) })
            .catch(error => console.error(error))
    }, [props.accessCode])

    return (
        <>
            {props.accessCode === undefined ?
                <AccessCodeForm subtitle={props.subtitle} button={props.button} redirect={props.redirect} action={props.action}/>
                :
                props.action === "edit" && <GameEditor accessCode={props.accessCode} categories={categories}/> ||
                props.action === "upload" && <Uploader accessCode={props.accessCode} categories={categories}/>}
            <Toast ref={toastErr}/>
        </>

)
}