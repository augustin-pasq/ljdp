import React from "react"
import AccessCodeDispatcher from "@/components/AccessCode/AccessCodeDispatcher"
import {useRouter} from "next/router"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"

export default function Upload(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour uploader tes photos :" button="Uploader mes photos" accessCode={router.query.accessCode} user={props.user} redirect="/upload" action="upload"/>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)