import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import Link from "next/link"
import {Password} from "primereact/password"
import React, {useState} from "react"
import {useFormik} from "formik"
import {useRouter} from "next/router"

export default function Register() {
    const [errorMessage, setErrorMessage] = useState("")
    const router = useRouter()

    const formik = useFormik({
        initialValues: {
            username: "",
            password: ""
        },
        validate: (data) => {
            let errors = {}

            if (!data.username || /^\s*$/.test(data.username)) errors.username = "Requis."
            if (data.password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+/.test(data.password)) errors.password = "Doit contenir au moins 8 caractères dont une majuscule et un chiffre."
            if (!data.password || /^\s*$/.test(data.password)) errors.password = "Requis."

            return errors
        },
        onSubmit: async (data) => {
            const request = await (await fetch("/api/user/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: data.username, password: data.password}),
            }))

            if (request.status === 200) {
                const data = await request.json()
                data.success ? await router.push("/home") : setErrorMessage("userAlreadyExists")
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])
    const getFormErrorMessage = (value) => {
        return isFormFieldInvalid(value) ? <small className="p-error">{formik.errors[value]}</small> : ""
    }

    return (
        <div id="credentials">
            <h1>Inscription</h1>

            {errorMessage === "userAlreadyExists" && <span className="p-error">Ce nom d'utilisateur est déjà pris.</span>}

            <form onSubmit={formik.handleSubmit}>
                <div>
                    <InputText id="username" className={isFormFieldInvalid("username") ? "p-invalid" : ""} name="username" placeholder="Nom d'utilisateur" maxLength={32} value={formik.values.username} onChange={formik.handleChange}/>
                    {getFormErrorMessage("username")}
                </div>

                <div>
                    <Password id="password" className={isFormFieldInvalid("password") ? "p-invalid" : ""} name="password" placeholder="Mot de passe" feedback={false} toggleMask value={formik.values.password} onChange={formik.handleChange}/>
                    {getFormErrorMessage("password")}
                </div>

                <Button label="S'inscrire" type="submit" rounded/>
            </form>

            <footer>
                <span>Déjà un compte ?</span>
                <Link href="/login">
                    <Button label="Se connecter" link/>
                </Link>
            </footer>
        </div>
    )
}