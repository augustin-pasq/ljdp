import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {useRouter} from "next/router"

export default function Join(props) {
    const router = useRouter()

    return (
        <AccessCodeDispatcher accessCode={router.query.accessCode} gameOwner={router.query.owner} user={props.user} />
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)