import React from "react"
import {useRouter} from "next/router"
import {withSessionSsr} from "../../lib/ironSession"
import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"

export default function Edit(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="LJDP a besoin du code d'accès pour retrouver la partie :" button="Accéder au panneau d'édition" redirect="/edit" accessCode={router.query.accessCode} user={props.user} action="edit"/>
    )
}

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req}) {
    const user = req.session.user

    if (!user?.isLoggedIn) {
        return {
            redirect: {
                permanent: false, destination: "/login"
            }
        }
    }

    return {
        props: {
            user: user.id
        }
    }
})