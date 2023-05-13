import GameEditor from "@/pages/Components/GameEditor";
import React, {useState, useEffect} from "react";
import AccessCodeForm from "@/pages/Components/AccessCodeForm";
import Uploader from "@/pages/Components/Uploader";

export default function AccessCodeDispatcher(props) {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        async function getCategories() {
            return await (await fetch('/api/category/getCategories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({accessCode: props.accessCode}),
            })).json()
        }

        getCategories()
            .then((result) => { setCategories(result.content) })
            .catch(error => console.error(error))
    }, [props.accessCode])

    return (
        props.accessCode === undefined ?
            <AccessCodeForm subtitle={props.subtitle} button={props.button} redirect={props.redirect} action={props.action}/>
            :
            props.action === "edit" && <GameEditor accessCode={props.accessCode} categories={categories}/> ||
            props.action === "upload" && <Uploader accessCode={props.accessCode} categories={categories}/>
    )
}