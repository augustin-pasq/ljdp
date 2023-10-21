import React, {useEffect, useRef, useState} from "react"
import {Card} from "primereact/card"
import {InputText} from "primereact/inputtext"
import {Button} from "primereact/button"
import {useFormik} from "formik"
import {classNames} from "primereact/utils"
import {Toast} from "primereact/toast"
import {useRouter} from "next/router";

export default function GameEditor(props) {
    const [categories, setCategories] = useState([])
    const toastCopy = useRef(null)
    const toastErr = useRef(null)
    const [hasToScroll, setHasToScroll] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (hasToScroll) {
            document.getElementById("categories-container").scrollTo({top: document.getElementById("categories-container").scrollHeight, behavior: "smooth"})
            setHasToScroll(false)
        } else {
            setCategories(props.categories)
        }
    }, [categories])

    const formik = useFormik({
        initialValues: {
            title: "",
        },
        validate: (data) => {
            let errors = {}

            if (!data.title || /^\s*$/.test(data.title)) errors.title = "Requis."

            return errors
        },
        onSubmit: async (data) => {
            const results = await (await fetch("/api/category/createCategory", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: data.title, accessCode: props.accessCode}),
            }))

            switch(results.status) {
                case 200:
                    const content = await results.json()
                    setCategories([...categories, {id: content.id, title: content.title}])
                    setHasToScroll(true)
                    break
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const handleDelete = async (id) => {
        const results = await fetch("/api/category/deleteCategory", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id}),
        })

        switch(results.status) {
            case 200:
                document.getElementById(id).remove()
                break
            case 500:
                toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                break
        }
    }

    return (
        <>
            <Card className="panel-size shadow-7 border-round-4xl px-4 py-2 flex align-items-center justify-content-center">
                <h1 className="text-6xl text-center pb-4">Nouvelle partie</h1>
                <div className="grid md:flex-row flex-column">
                    <div className="col-7 pr-6 pl-3 py-3 flex-column justify-content-start">
                        <h2 className="text-3xl text-center pb-2">Catégories</h2>
                        <div className="flex flex-column gap-3 p-3">
                            <form onSubmit={formik.handleSubmit} className="grid category-item pl-3 pr-2 py-2 shadow-3 border-round-lg align-items-center">
                                <div className="col-11">
                                    <InputText id="title"
                                               name="title"
                                               placeholder="Titre"
                                               value={formik.values.title}
                                               onChange={formik.handleChange}
                                               className={`w-full ${classNames({"p-invalid": isFormFieldInvalid("title")})}`}
                                    />
                                </div>
                                <div className="col-1">
                                    <Button type="submit" icon="pi pi-plus"/>
                                </div>
                            </form>
                        </div>
                        {categories && categories.length > 0 &&
                            <div className="flex flex-column gap-3 p-3 no-scroll" id="categories-container">
                                {categories.map((category, index) => {
                                    return (
                                        <div key={index} id={category.categoryId} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center">
                                            <span className="col-11">{category.title}</span>
                                            <span className="col-1"><Button className="h-3rem" icon="pi pi-trash" onClick={() => handleDelete(category.categoryId)}/></span>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    </div>

                    <div className="col-5 pr-3 pl-6 py-3 flex-column align-items-center">
                        <h2 className="text-3xl text-center pb-2">Jouer avec des amis</h2>
                        <div className="flex flex-column justify-content-center full-height-card-edit">
                            <div className="flex flex-column justify-content-center text-lg text-center pb-6">
                                <div className="flex flex-row align-items-center justify-content-center">
                                    <span className="game-access">{props.accessCode}</span>
                                    <Button icon="pi pi-copy" rounded text onClick={() => {
                                        navigator.clipboard.writeText(`${props.accessCode}`).then(toastCopy.current.show({
                                            severity: "success",
                                            summary: "Le code a été copié",
                                            detail: "Partage-le avec tes amis !",
                                            life: 3000
                                        }))
                                    }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button label="Retourner à l'accueil" type="submit" size="large" className="mt-5 align-self-center" rounded onClick={() => router.push("/home")}/>
            </Card>
            <Toast ref={toastErr}/>
            <Toast ref={toastCopy}/>
        </>
    )
}