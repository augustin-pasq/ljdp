import React from "react"
import {useRouter} from "next/router"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import AccessCodeDispatcher from "@/components/AccessCode/AccessCodeDispatcher"

export default function Edit(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="LJDP a besoin du code d'accès pour retrouver la partie :" button="Accéder au panneau d'édition" redirect="/edit" accessCode={router.query.accessCode} user={props.user} action="edit"/>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)