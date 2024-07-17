import {Button} from "primereact/button"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import Navbar from "@/components/Navbar"
import Photo from "@/components/Photo";
import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"
import {InputText} from "primereact/inputtext";
import {useFormik} from "formik";
import {youtubeURLParser} from "../../../utils/youtubeURLParser"

export default function Upload(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const router = useRouter()
    const [categories, setCategories] = useState(null)
    const [game, setGame] = useState(null)
    const [isMobile, setIsMobile] = useState(true)
    const [photo, setPhoto] = useState({link: "", type: ""})
    const [rendered, setRendered] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        setIsMobile(mediaQuery)

        if (!rendered) {
            getCategories(parseInt(router.query.id), router)
                .then(result => {
                    if (result !== null) {
                        setGame(result.game)
                        setCategories(result.categories)
                        setRendered(true)
                    }
                })
        }
    }, [mediaQuery])

    const selectCategory = (category) => {
        setPhoto({type: category.type, link: category.link ?? ""})
        setSelectedCategory(category)
        if (isMobile) window.scrollTo({top: 0, behavior: "smooth"})
    }

    const uploadPhoto = async (e) => {
        let newPhotoState = {...photo}
        newPhotoState.link = "loading"
        setPhoto(newPhotoState)

        const formData = new FormData()
        formData.append(e.target ? "file" : "link", e.target ? e.target.files[0] : e.link)
        formData.append("category", selectedCategory.id)
        formData.append("game", game.id)

        const request = await fetch("/api/photo/addPhoto",{
            method: "POST",
            body: formData
        })

        if (request.status === 200) {
            const data = await request.json()
            let dataCopy = [...categories]
            dataCopy[categories.findIndex(category => category.id === selectedCategory.id)].link = data.content
            setCategories(dataCopy)

            newPhotoState.link = data.content
            setPhoto(newPhotoState)
        }
    }

    const formik = useFormik({
        initialValues: {
            link: "",
        },
        validate: (data) => {
            let errors = {}

            if (!data.link) errors.link = "Requis."
            else if (!youtubeURLParser(data.link)) errors.link = "Format invalide."

            return errors
        },
        onSubmit: async (data) => {
            await uploadPhoto(data)

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const deletePhoto = async () => {
        const request = await fetch("/api/photo/deletePhoto", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({link: photo.link}),
        })

        if (request.status === 200) {
            const newPhotoState = {...photo}
            newPhotoState.link = ""
            setPhoto(newPhotoState)

            let dataCopy = [...categories]
            dataCopy[categories.findIndex(category => category.id === selectedCategory.id)].link = null
            setCategories(dataCopy)
        }
    }

    return (
        <>
            <Navbar user={props.user} isMobile={isMobile}/>
            <main id="dashboard">
                <h1 id="page-title">Uploader des photos</h1>

                <div id="container">
                    <section className="list-container" style={{width: "60%"}}>
                        <span className="section-header">Catégories</span>
                        <Categories categories={categories} clickable handleAction={selectCategory} page="upload" selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                    </section>

                    <section id="uploader-container" className="side-container" style={{width: "40%"}}>
                        {selectedCategory ?
                            <>
                                {photo.link !== "" && photo.link !== "loading" ?
                                    <>
                                        <Photo photo={photo} />
                                        <Button rounded severity="danger" label="Supprimer le fichier" onClick={deletePhoto}/>
                                    </>
                                    :
                                    <>
                                        {(photo.type === "image" || photo.type === "video") &&
                                            <div id="drop-area" className={photo.link === "loading" && "disabled"}>
                                                <i className={photo.link !== "loading" ? "pi pi-cloud-upload" : "pi pi-spin pi-spinner"} />
                                                <span>{photo.link !== "loading" ? "Clique ou dépose ton fichier ici" : "Envoi en cours..."}</span>
                                                <input className={`media-input ${photo.link === "loading" && "disabled"}`} id="file" type="file" disabled={photo.link === "loading"} multiple={false} accept={`${photo.type}/*`} onChange={uploadPhoto}/>
                                            </div>
                                        }
                                        {photo.type === "youtube" &&
                                            <form onSubmit={formik.handleSubmit}>
                                                <InputText id="link" className={isFormFieldInvalid("link") ? "p-invalid" : ""} name="link" placeholder="Lien" value={formik.values.link} onChange={formik.handleChange}/>
                                                <Button type="submit" icon="pi pi-check" rounded/>
                                            </form>
                                        }
                                    </>
                                }
                            </>
                            :
                            <span id="instructions">Sélectionne une catégorie pour uploader un fichier.</span>
                        }
                    </section>
                </div>
            </main>
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)