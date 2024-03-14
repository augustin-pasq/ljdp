import React from "react"
import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {useRouter} from "next/router"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"

export default function Upload(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :" button="Accéder à la partie" accessCode={router.query.accessCode} user={props.user} gameOwner={router.query.owner} redirect="/play" action="play"/>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)