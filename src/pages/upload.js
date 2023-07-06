import React from "react"
import AccessCodeDispatcher from "@/pages/Components/AccessCodeDispatcher"
import {useRouter} from "next/router"

export default function Upload() {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour uploader tes photos :" button="Uploader mes photos" accessCode={router.query.accessCode} redirect="/upload" action="upload"/>
    )
}