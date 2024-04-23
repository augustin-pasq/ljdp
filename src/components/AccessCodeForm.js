import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import Navbar from "@/components/Navbar"
import {useEffect, useState} from "react"
import {useFormik} from "formik"
import {useRouter} from "next/router"

export default function AccessCodeForm(props) {
    const [errorMessage, setErrorMessage] = useState("")
    const [formText, setFormText] = useState({})
    const router = useRouter()

    useEffect(() => {
        switch (router.pathname) {
            case "/edit":
                setFormText( {
                    subtitle: "Entre ici le code de la partie que tu veux éditer :",
                    button: "Éditer la partie"
                })
                break
            case "/upload":
                setFormText( {
                    subtitle: "Entre ici le code qu'on t'a envoyé pour uploader tes photos :",
                    button: "Uploader mes photos"
                })
                break
            case "/join":
                setFormText( {
                    subtitle: "Entre ici le code qu'on t'a envoyé pour rejoindre tes amis :",
                    button: "Rejoindre mes amis"
                })
                break
            case "/play":
                setFormText( {
                    subtitle: "Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :",
                    button: "Jouer avec mes amis"
                })
                break
            case "/scores":
                setFormText( {
                    subtitle: "Entre ici le code de la partie dont tu veux consulter les scores :",
                    button: "Consulter les scores"
                })
        }
    }, [])

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
            const request = await fetch("/api/game/getGame", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({code: data.code, target: props.redirect, owner: props.user.id}),
            })

            if (request.status === 200) {
                const data = await request.json()
                if (data.success) {
                    await router.push({
                        pathname: `${props.redirect}`,
                        query: data.content,
                    }, `${props.redirect}`)
                } else {
                    switch (data.message) {
                        case "not_found":
                            setErrorMessage("Aucune partie n'existe pour ce code.")
                            break
                        case "unauthorized":
                            setErrorMessage("Tu ne peux pas gérer les catégories d'une partie que tu n'as pas créée.")
                            break
                        case "ended":
                            setErrorMessage("Tu ne peux pas accéder à une partie terminée, désolé !")
                            break
                        case "started":
                            setErrorMessage("La partie a déjà commencé, il fallait être plus rapide !")
                            break
                        case "not_started_yet":
                            setErrorMessage("La partie n'a pas encore commencé, reviens ici plus tard !")
                            break
                    }
                }
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const getFormErrorMessage = (value) => {
        return isFormFieldInvalid(value) ? <small className="p-error">{formik.errors[value]}</small> : ""
    }

    return (
        <>
            <Navbar user={props.user}/>
            <main id="accesscodeform">
                <div id="container">
                    <div className="header">
                        <span id="title">Le code de la partie, s'il vous plait ?</span>
                        <span>{formText.subtitle}</span>
                    </div>

                    {errorMessage && <span className="p-error">{errorMessage}</span>}

                    <form onSubmit={formik.handleSubmit}>
                        <div>
                            <InputText id="code" className={isFormFieldInvalid("code") ? "p-invalid" : ""} name="code" maxLength={4} value={formik.values.code} onChange={(e) => {formik.setFieldValue("code", e.target.value.toUpperCase())}} />
                            {getFormErrorMessage("code")}
                        </div>

                        <Button label={formText.button} type="submit" rounded/>
                    </form>
                </div>
            </main>
        </>
    )
}