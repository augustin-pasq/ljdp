import {Button} from "primereact/button"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import {InputText} from "primereact/inputtext"
import Navbar from "@/components/Navbar"
import {useEffect, useState} from "react"
import {useFormik} from "formik"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

export default function Edit(props) {
    const mediaQuery = useMediaQuery({maxWidth: 1280})
    const router = useRouter()
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [categories, setCategories] = useState(null)
    const [game, setGame] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [lastPerformedAction, setLastPerformedAction] = useState("")
    const [rendered, setRendered] = useState(false)

    useEffect(() => {
        if (!rendered) {
            setIsMobile(mediaQuery)
            getCategories(parseInt(router.query.id))
                .then(result => {
                    setGame(result.game)
                    setCategories(result.categories)
                })
                .then(() => setRendered(true))
        } else if (lastPerformedAction === "add") {
            window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"})
        }
    }, [mediaQuery, categories])

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
            const request = await (await fetch("/api/category/addCategory", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: data.title, gameId: game.id}),
            }))

            if(request.status === 200) {
                const data = await request.json()
                setCategories([...categories, {id: data.content.id, title: data.content.title}])
                setLastPerformedAction("add")
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const deleteCategory = async (id) => {
        const request = await fetch("/api/category/deleteCategory", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({categoryId: id}),
        })

        if(request.status === 200) {
            setCategories(categories.filter(category => category.id !== id))
            setLastPerformedAction("delete")
        }
    }

    return (
        <>
            <Navbar user={props.user} isMobile={isMobile} />
            <main id="dashboard">
                <h1 className="page-title">Éditer la partie</h1>

                <div id="container" style={{flexDirection: isMobile ? "column-reverse" : "row"}}>
                    <section className="list-container" style={{width: "66%"}}>
                        <span className="section-header">Catégories</span>
                        <form onSubmit={formik.handleSubmit}>
                            <InputText id="title" className={isFormFieldInvalid("title") ? "p-invalid" : ""} name="title" placeholder="Titre" value={formik.values.title} onChange={formik.handleChange}/>
                            <Button type="submit" icon="pi pi-plus" rounded/>
                        </form>
                        <Categories buttonIcon="pi pi-trash" categories={categories} handleAction={deleteCategory} page="join" />
                    </section>

                    <section id="instructions-container" className="side-container" style={{width: "33%"}}>
                        <span id="title">Voici le code d'accès de la partie :</span>
                        <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={game !== null ? game.accessCode : ""} onClick={() => {navigator.clipboard.writeText(`${props.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                        <div id="links-container">
                            <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                            <span><a href={`https://ljdp.augustinpasquier.fr/upload/${game !== null ? game.id : ""}`} target="_blank">{`ljdp.augustinpasquier.fr/upload/${game !== null ? game.id : ""}`}</a> pour uploader des photos</span>
                            <span><a href={`https://ljdp.augustinpasquier.fr/join/${game !== null ? game.id : ""}`} target="_blank">{`ljdp.augustinpasquier.fr/upload/${game !== null ? game.id : ""}`}</a> pour commencer la partie</span>
                        </div>
                    </section>
                </div>
            </main>
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)