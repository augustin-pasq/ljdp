import React from "react"
import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {useRouter} from "next/router"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"

export default function Join(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher accessCode={router.query.accessCode} gameOwner={router.query.owner} user={props.user} />
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)