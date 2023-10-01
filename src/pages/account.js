import React, {useRef} from "react"
import {Card} from "primereact/card"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../lib/ironSession"
import {useRouter} from "next/router"
import {Toast} from "primereact/toast"

export default function Account() {
    const router = useRouter()
    const toastErr = useRef(null)

    const handleLogout = async () => {
        const results = await fetch("/api/user/logout", {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        })

        switch(results.status) {
            case 200:
                await router.push("/")
                break
            case 500:
                toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                break
        }
    }

    return (
        <div className="grid">
            <div className="col-12 md:col-6 p-3 flex justify-content-center md:justify-content-end scale-in-br scale-in-center-1">
                <Card className="card-home flex square border-round-4xl w-screen md:w-16rem justify-content-center align-items-center text-center" onClick={handleLogout}>
                    <h1 className="text-4xl text-center">Me déconnecter</h1>
                    <span className="text-4xl">🔚</span>
                </Card>
            </div>

            <Toast ref={toastErr}/>
        </div>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)