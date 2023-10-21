import React from "react"
import AccessCodeDispatcher from "@/components/AccessCode/AccessCodeDispatcher"
import {useRouter} from "next/router"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"

export default function Upload(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code de la partie dont tu veux consulter les scores :" button="Voir les scores" accessCode={router.query.accessCode} user={props.user} redirect="/scores" action="scores"/>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)