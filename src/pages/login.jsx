import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import Link from "next/link"
import {Password} from "primereact/password"
import {useFormik} from "formik"
import {useRouter} from "next/router"
import {useState} from "react"

export default function Login() {
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
            if (!data.password || /^\s*$/.test(data.password)) errors.password = "Requis."

            return errors
        },
        onSubmit: async (data) => {
            const request = await (await fetch("/api/user/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: data.username, password: data.password}),
            }))

            if (request.status === 200) {
                const data = await request.json()
                data.success ? await router.push("/") : setErrorMessage("badCredentials")
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
            <h1>Connexion</h1>

            {errorMessage === "badCredentials" && <span className="p-error">Nom d'utilisateur ou mot de passe invalide.</span>}

            <form onSubmit={formik.handleSubmit}>
                <div>
                    <InputText id="username" className={isFormFieldInvalid("username") ? "p-invalid" : ""} name="username" placeholder="Nom d'utilisateur" maxLength={32} value={formik.values.username} onChange={formik.handleChange}/>
                    {getFormErrorMessage("username")}
                </div>

                <div>
                    <Password id="password" className={isFormFieldInvalid("password") ? "p-invalid" : ""} name="password" placeholder="Mot de passe" feedback={false} toggleMask value={formik.values.password} onChange={formik.handleChange}/>
                    {getFormErrorMessage("password")}
                </div>

                <Button label="Se connecter" type="submit" rounded/>
            </form>

            <footer>
                <span>Besoin d'un compte ?</span>
                <Link href="/src/pages/register">
                    <Button label="S'inscrire" className="px-2" link/>
                </Link>
            </footer>
        </div>
    )
}