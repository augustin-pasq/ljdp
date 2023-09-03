import React, {useEffect, useRef, useState} from "react"
import {Card} from "primereact/card"
import {InputText} from "primereact/inputtext"
import {Dropdown} from "primereact/dropdown"
import {Button} from "primereact/button"
import {useFormik} from "formik"
import {classNames} from "primereact/utils"
import {Divider} from "primereact/divider"
import {Toast} from "primereact/toast"
import {ToggleButton} from "primereact/togglebutton"

export default function GameEditor(props) {
    const [categories, setCategories] = useState([])
    const [checked, setChecked] = useState(true)
    const toastCopy = useRef(null)
    const toastErr = useRef(null)
    const [hasToScroll, setHasToScroll] = useState(false)

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
            type: ""
        },
        validate: (data) => {
            let errors = {}

            if (!data.title || /^\s*$/.test(data.title)) errors.title = "Requis."
            if (!data.type || /^\s*$/.test(data.type)) errors.type = "Requis."

            return errors
        },
        onSubmit: async (data) => {
            const results = await (await fetch("/api/category/createCategory", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: data.title, type: data.type, accessCode: props.accessCode}),
            }))

            switch(results.status) {
                case 200:
                    const content = await results.json()
                    setCategories([...categories, {id: content.id, title: content.title, type: content.type}])
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

    const handleGameStatus = async (button) => {
        const results = await fetch("/api/game/setStatus", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({accessCode: props.accessCode, status: button ? "Créée" : "Commencée"}),
        })

        switch(results.status) {
            case 200:
                setChecked(button)
                break
            case 500:
                toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                break
        }
    }

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
                                <div className="col-8">
                                    <InputText id="title"
                                               name="title"
                                               placeholder="Titre"
                                               value={formik.values.title}
                                               onChange={formik.handleChange}
                                               className={`w-full ${classNames({"p-invalid": isFormFieldInvalid("type")})}`}
                                    />
                                </div>
                                <div className="col-3">
                                    <Dropdown inputId="type" name="type" value={formik.values.type}
                                              placeholder="Type"
                                              onChange={(e) => {
                                                  formik.setFieldValue("type", e.value)
                                              }} options={["Photo", "Vidéo", "YouTube"]}
                                              className={`w-10rem ${classNames({"p-invalid": isFormFieldInvalid("type")})}`}/>
                                </div>
                                <div className="col-1">
                                    <Button type="submit" icon="pi pi-plus"/>
                                </div>
                            </form>
                        </div>
                        {categories.length > 0 &&
                            <div className="flex flex-column gap-3 p-3 no-scroll" id="categories-container">
                                {categories.map((category, index) => {
                                    return (
                                        <div key={index} id={category.categoryId} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center">
                                            <span className="col-8">{category.title}</span>
                                            <span className="col-3">{category.type}</span>
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

                            {checked &&
                                <div className="flex flex-column justify-content-center text-lg text-center pb-6">
                                    <p>Demande à tes amis d'aller sur <span
                                        className="text-xl text-primary">ljdp.augustinpasquier.com/upload</span> et de
                                        saisir ce code :</p>
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
                                    <Divider layout="horizontal" align="center">
                                        <b>OU</b>
                                    </Divider>
                                    <p>Envoie-leur ce lien :</p>
                                    <div className="flex flex-row align-items-center justify-content-center">
                                        <span
                                            className="game-access">ljdp.augustinpasquier.com/upload/{props.accessCode}</span>
                                        <Button icon="pi pi-copy" rounded text onClick={() => {
                                            navigator.clipboard.writeText(`ljdp.augustinpasquier.com/play/${props.accessCode}`).then(toastCopy.current.show({
                                                severity: "success",
                                                summary: "Le lien a été copié",
                                                detail: "Partage-le avec tes amis !",
                                                life: 3000
                                            }))
                                        }}/>
                                    </div>
                                </div>
                            }

                            {!checked &&
                                <div className="flex flex-column justify-content-center text-lg text-center pb-6">
                                    <p>Demande à tes amis d'aller sur <span
                                        className="text-xl text-primary">ljdp.augustinpasquier.com/play</span> et de saisir
                                        ce code :</p>
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
                                    <Divider layout="horizontal" align="center">
                                        <b>OU</b>
                                    </Divider>
                                    <p>Envoie-leur ce lien :</p>
                                    <div className="flex flex-row align-items-center justify-content-center">
                                        <span
                                            className="game-access">ljdp.augustinpasquier.com/play/{props.accessCode}</span>
                                        <Button icon="pi pi-copy" rounded text onClick={() => {
                                            navigator.clipboard.writeText(`ljdp.augustinpasquier.com/play/${props.accessCode}`).then(toastCopy.current.show({
                                                severity: "success",
                                                summary: "Le lien a été copié",
                                                detail: "Partage-le avec tes amis !",
                                                life: 3000
                                            }))
                                        }}/>
                                    </div>
                                </div>
                            }

                            <div className="flex flex-wrap flex-column align-items-center">
                                <ToggleButton onLabel="Démarrer la partie"
                                              offLabel="Arrêter la partie"
                                              checked={checked}
                                              onChange={(e) => handleGameStatus(e.value)}/>

                                {checked &&
                                    <small className="pt-3 text-700">(Toi et tes amis ne pourrez plus uploader de fichiers une fois la partie commencée.)</small>
                                }

                                {!checked &&
                                    <small className="pt-3 text-700">(La partie reprendra depuis le début et les scores seront réinitialisés.)</small>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Toast ref={toastErr}/>
            <Toast ref={toastCopy}/>
        </>
    )
}