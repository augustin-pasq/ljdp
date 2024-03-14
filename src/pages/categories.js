import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import React from "react"
import {useRouter} from "next/router"

export default function Categories(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code de la partie pour laquelle tu veux gérer les catégories :" button="Accéder au panneau d'édition" redirect="/categories" accessCode={router.query.accessCode} user={props.user} action="edit"/>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)