import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import React from "react"
import {useRouter} from "next/router"

export default function Edit(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher accessCode={router.query.accessCode} user={props.user} />
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)