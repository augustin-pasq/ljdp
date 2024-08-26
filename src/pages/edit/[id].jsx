import {Button} from "primereact/button"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import {InputText} from "primereact/inputtext"
import Navbar from "@/components/Navbar"
import {SelectButton} from "primereact/selectbutton"
import {Toast} from "primereact/toast"
import {useEffect, useRef, useState} from "react"
import {useFormik} from "formik"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

export default function Edit(props) {
    const mediaQuery = useMediaQuery({maxWidth: 855})
    const toast = useRef(null)
    const router = useRouter()
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [categories, setCategories] = useState(null)
    const [game, setGame] = useState(null)
    const [isMobile, setIsMobile] = useState(true)
    const [lastPerformedAction, setLastPerformedAction] = useState("")
    const [rendered, setRendered] = useState(false)

    const typeOptions = [
        {icon: "pi pi-image", value: "image"},
        {icon: "pi pi-video", value: 'video'},
        {icon: "pi pi-youtube", value: "youtube"},
    ]

    useEffect(() => {
        setIsMobile(mediaQuery)

        if (!rendered) {
            getCategories(parseInt(router.query.id), router)
                .then(result => {
                    if (result !== null) {
                        setGame(result.game)
                        setCategories(result.categories)
                        setRendered(true)

                        if (router.query.displayToast) {
                            toast.current.show({severity: "success", detail: "La partie a été ajoutée à ton compte !"})
                        }
                    }
                })
        } else if (lastPerformedAction === "add") {
            window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"})
        }
    }, [mediaQuery, categories])

    const formik = useFormik({
        initialValues: {
            title: "",
            type: "image"
        },
        validate: (data) => {
            let errors = {}

            if (!data.title || /^\s*$/.test(data.title)) errors.title = "Requis."
            if (!data.type || (data.type !== "image" && data.type !== "video" && data.type !== "youtube")) errors.type = "Requis."

            return errors
        },
        onSubmit: async (data) => {
            const request = await (await fetch("/api/category/addCategory", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: data.title, type: data.type, game: game.id}),
            }))

            if(request.status === 200) {
                const data = await request.json()
                setCategories([...categories, {id: data.content.id, title: data.content.title, type: data.content.type}])
                setLastPerformedAction("add")
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const deleteCategory = async (category) => {
        let categoryId = category.id

        const request = await fetch("/api/category/deleteCategory", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({category: categoryId}),
        })

        if(request.status === 200) {
            setCategories(categories.filter(category => category.id !== categoryId))
            setLastPerformedAction("delete")
        }
    }

    return (
        <>
            <Navbar user={props.user} isMobile={isMobile} />
            <main id="dashboard">
                <h1 id="page-title">Éditer la partie</h1>

                <div id="container">
                    <section className="list-container" style={{width: "66%"}}>
                        <span className="section-header">Catégories</span>
                        <form onSubmit={formik.handleSubmit}>
                            <InputText id="title" className={isFormFieldInvalid("title") ? "p-invalid" : ""} name="title" placeholder="Titre" value={formik.values.title} onChange={formik.handleChange}/>
                            <div className="action-buttons">
                                <SelectButton id="type" className={isFormFieldInvalid("type") ? "p-invalid" : ""} name="type" itemTemplate={(option) => <i className={option.icon} />} optionLabel="value" options={typeOptions} value={formik.values.type} onChange={formik.handleChange} />
                                <Button type="submit" icon="pi pi-plus" rounded/>
                            </div>
                        </form>
                        <Categories buttonIcon="pi pi-trash" categories={categories} handleAction={deleteCategory} page="edit" />
                    </section>

                    <section id="instructions-container" className="side-container" style={{width: "33%"}}>
                        <span id="title">Voici le code d'accès de la partie :</span>
                        <div id="code-container">
                            <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={game !== null ? game.accessCode : ""} onClick={() => {navigator.clipboard.writeText(`${game.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                            <Button icon="pi pi-copy" rounded text onClick={async () => {await navigator.clipboard.writeText(`${game.accessCode}`)}} />
                        </div>
                        <div id="links-container">
                            <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                            <span><a href={`https://ljdp.augustinpasquier.fr/upload/${game !== null ? game.id : ""}`} target="_blank">{`ljdp.augustinpasquier.fr/upload/${game !== null ? game.id : ""}`}</a> pour uploader des photos</span>
                            <span><a href={`https://ljdp.augustinpasquier.fr/play/${game !== null ? game.id : ""}`} target="_blank">{`ljdp.augustinpasquier.fr/play/${game !== null ? game.id : ""}`}</a> pour commencer la partie</span>
                        </div>
                    </section>
                </div>
            </main>
            <Toast ref={toast} position="bottom-center" />
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)