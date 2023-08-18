import React from "react"
import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {useRouter} from "next/router"
import {withSessionSsr} from "../../lib/ironSession"

export default function Upload(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour uploader tes photos :" button="Uploader mes photos" accessCode={router.query.accessCode} user={props.user} redirect="/upload" action="upload"/>
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