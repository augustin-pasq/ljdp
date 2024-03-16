import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import React from "react"
import {useRouter} from "next/router"

export default function Play(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher accessCode={router.query.accessCode} gameOwner={router.query.owner} user={props.user} />
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)