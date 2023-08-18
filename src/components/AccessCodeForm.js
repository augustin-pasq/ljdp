import React, {useState} from "react"
import {Card} from "primereact/card"
import {InputText} from "primereact/inputtext"
import {useFormik} from "formik"
import {classNames} from "primereact/utils"
import {Button} from "primereact/button"
import {useRouter} from "next/router"

export default function AccessCodeForm(props) {
    const [errorMessage, setErrorMessage] = useState("")
    const router = useRouter()

    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validate: (data) => {
            let errors = {}

            if (!data.code || /^\s*$/.test(data.code)) errors.code = "Requis."
            else if (!data.code || !/^[a-zA-Z0-9]{4}$/.test(data.code)) errors.code = "Le code doit comporter exactement 4 caractères et uniquement des lettres et des chiffres."

            return errors
        },
        onSubmit: async (data) => {
            const results = await fetch("/api/game/getGame", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({code: data.code, action: props.action, owner: props.user}),
            })

            switch(results.status) {
                case 200:
                    const content = await results.json()
                    await router.push({
                        pathname: `${props.redirect}`,
                        query: {accessCode: content.accessCode},
                    }, `${props.redirect}`)
                    break
                case 404:
                    setErrorMessage("badAccessCode")
                    break
                case 500:
                    setErrorMessage("undefinedError")
                    break
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const getFormErrorMessage = (value) => {
        return isFormFieldInvalid(value) ? <small className="p-error max-w-20rem text-center">{formik.errors[value]}</small> : ""
    }

    return (
        <Card className="max-w-30rem shadow-7 fadeinup-light border-round-4xl">
            <div className="flex flex-column align-items-center">
                <h1 className="text-6xl text-7xl px-7 pt-6 pb-5 text-center">Le Jeu Des Photos</h1>
                <span className="text-lg text-center px-5 pb-4 text-700">{props.subtitle}</span>

                <form className="flex flex-column align-items-center row-gap-3" onSubmit={formik.handleSubmit}>
                    <InputText id="code" name="code" maxLength={4} value={formik.values.code} onChange={(e) => {formik.setFieldValue("code", e.target.value.toUpperCase())}} className={`p-inputtext-lg access-code-field w-12rem h-6rem ${classNames({"p-invalid": isFormFieldInvalid("code")})}`} />
                    {getFormErrorMessage("code")}

                    {errorMessage === "badAccessCode" &&
                        <div className="flex flex-row align-items-center justify-content-center mt-3 text-center max-w-20rem">
                            <span className="p-error">Aucune partie n'existe pour ce code ou cette action n'est pas disponible pour la partie.</span>
                        </div>
                    }
                    {errorMessage === "undefinedError" &&
                        <div className="flex flex-row align-items-center justify-content-center mt-3 text-center max-w-20rem">
                            <span className="p-error">Une erreur s'est produite. Réessaye pour voir ?</span>
                        </div>
                    }

                    <Button label={props.button} type="submit" size="large" className="mt-6 mb-3" rounded/>
                </form>
            </div>
        </Card>
    )
}