import React, {useState} from "react"
import {Card} from "primereact/card"
import {InputText} from "primereact/inputtext"
import {Button} from "primereact/button"
import {Password} from "primereact/password"
import Link from "next/link"
import {useFormik} from "formik"
import {classNames} from 'primereact/utils'
import {useRouter} from "next/router"

export default function Login() {
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validate: (data) => {
            let errors = {}

            if (!data.username || /^\s*$/.test(data.username)) errors.username = 'Requis.'
            if (!data.password || /^\s*$/.test(data.password)) errors.password = 'Requis.'

            return errors
        },
        onSubmit: async (data) => {
            const body = {
                username: data.username,
                password: data.password
            }
            const results = await (await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            }))

            switch(results.status) {
                case 200:
                    await router.push('/home')
                    break
                case 401:
                case 409:
                    setErrorMessage('badCredentials')
                    break
                case 500:
                    setErrorMessage('undefinedError')
                    break
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])
    const getFormErrorMessage = (value) => {
        return isFormFieldInvalid(value) ? <small className="p-error">{formik.errors[value]}</small> : ''
    }

    return (
        <Card className="max-w-30rem shadow-7 fadeinup-light border-round-4xl">
            <div className="flex flex-column align-items-center">
                <h1 className="text-6xl md:text-7xl pt-5 md:pt-6 pb-6 md:pb-7 px-5 md:px-8">Connexion</h1>

                {errorMessage === 'badCredentials' &&
                    <div className="flex flex-row align-items-center justify-content-center pb-7">
                        <span className="p-error">Nom d'utilisateur ou mot de passe invalide.</span>
                    </div>
                }
                {errorMessage === 'undefinedError' &&
                    <div className="flex flex-row align-items-center justify-content-center pb-7">
                        <span className="p-error">Une erreur s'est produite. Réessaye pour voir ?</span>
                    </div>
                }

                <form className="flex flex-column align-items-center row-gap-6" onSubmit={formik.handleSubmit}>
                    <div className="flex flex-column align-items-start max-w-min row-gap-2">
                        <span className="p-float-label">
                            <InputText id="username" name="username" value={formik.values.username} onChange={formik.handleChange} maxLength={32} className={`p-inputtext-lg h-4rem ${classNames({'p-invalid': isFormFieldInvalid('username')})}`}/>
                            <label htmlFor="username">Nom d'utilisateur<span> *</span></label>
                        </span>
                        {getFormErrorMessage('username')}
                    </div>
                    <div className="flex flex-column align-items-start max-w-min row-gap-2">
                        <span className="p-float-label">
                            <Password id="password" name="password" feedback={false} value={formik.values.password} toggleMask onChange={formik.handleChange} className={`p-inputtext-lg h-4rem ${classNames({'p-invalid': isFormFieldInvalid('password')})}`}/>
                            <label htmlFor="password">Mot de passe<span> *</span></label>
                        </span>
                        {getFormErrorMessage('password')}
                    </div>
                    <Button label="Se connecter" type="submit" size="large" className="mt-3" rounded/>
                </form>

                <div className="flex flex-row align-items-center justify-content-center pt-5">
                    <span>Besoin d'un compte ?</span>
                    <Link href="/register">
                        <Button label="S'inscrire" className="px-2" link/>
                    </Link>
                </div>
            </div>
        </Card>
    )
}