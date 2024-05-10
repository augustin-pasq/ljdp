import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import {Toast} from "primereact/toast"
import {useFormik} from "formik"
import {useEffect, useRef, useState} from "react"
import {useRouter} from "next/router"
import {useMediaQuery} from "react-responsive";

export default function Home(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const toast = useRef(null)
    const router = useRouter()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(mediaQuery)
    }, [mediaQuery])

    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validate: (data) => {
            let errors = {}
            if (!data.code || /^\s*$/.test(data.code)) errors.code = "Requis."
            else if (!data.code || !/^[a-zA-Z0-9]{4}$/.test(data.code)) errors.code = "Le code doit comporter 4 caractères et uniquement des lettres et des chiffres."
            return errors
        },
        onSubmit: async (data) => {
            const request = await fetch("/api/participant/addParticipant", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({accessCode: data.code, user: props.user.id}),
            })

            if (request.status === 200) {
                const data = await request.json()
                switch(data.content.message) {
                    case "added":
                        toast.current.show({severity: "success", detail: "La partie a été ajoutée à ton compte !"})
                        break
                    case "already_added":
                        toast.current.show({severity: "error", detail: "Tu as déjà ajouté cette partie à ton compte."})
                        break
                    case "bad_status":
                        toast.current.show({severity: "error", detail: "Tu ne peux pas ajouter une partie commencée ou terminée."})
                        break
                    case "no_game":
                        toast.current.show({severity: "error", detail: "Aucune partie n'a été trouvée pour ce code."})
                        break
                }
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const navigateNewGame = async () => {
        const request = await fetch("/api/game/addGame", {
            method: "POST",
            headers: {"Content-Type": "application/json"}
        })

        if(request.status === 200) {
            const data = await request.json()
            await router.push({pathname: `/edit/${data.content.id}`, query: {displayToast: true}}, `/edit/${data.content.id}`)
        }
    }

    return(
        <>
            <Navbar user={props.user} isMobile={isMobile} />
            <main id="home">
                <div className="home-item">
                    <span className="title">🚀 Créer une partie</span>
                    <p className="description">Crée une partie, ajoute des catégories et invite tes amis !</p>
                    <Button label="Commencer" rounded onClick={navigateNewGame} />
                </div>
                <div className="home-item">
                    <span className="title">🚪 Rejoindre une partie</span>
                    <p className="description">Entre un code d'accès pour ajouter une partie à ton compte :</p>

                    <form onSubmit={formik.handleSubmit}>
                        <div id="input-wrapper">
                            <InputText id="code" className={isFormFieldInvalid("code") ? "p-invalid" : ""} name="code" maxLength={4} value={formik.values.code} onChange={(e) => {formik.setFieldValue("code", e.target.value.toUpperCase())}} />
                            <Button icon="pi pi-arrow-right" type="submit" rounded/>
                        </div>
                    </form>
                </div>
                <div className="home-item">
                    <span className="title">🎮 Jouer à LJDP</span>
                    <p className="description">Accède à la liste de tes parties, upload tes photos et joue avec tes amis !</p>
                    <Link href="/games">
                        <Button label="C'est parti !" rounded />
                    </Link>
                </div>
            </main>
            <Toast ref={toast} position="bottom-center" />
        </>
    )
}