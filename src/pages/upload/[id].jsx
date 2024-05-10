import {Button} from "primereact/button"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import Navbar from "@/components/Navbar"
import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

export default function Upload(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const router = useRouter()
    const [categories, setCategories] = useState(null)
    const [game, setGame] = useState(null)
    const [isMobile, setIsMobile] = useState(false)
    const [photo, setPhoto] = useState("")
    const [rendered, setRendered] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        setIsMobile(mediaQuery)

        if (!rendered) {
            getCategories(parseInt(router.query.id))
                .then(result => {
                    setGame(result.game)
                    setCategories(result.categories)
                    setRendered(true)
                })
        }
    }, [mediaQuery])

    const selectCategory = (category) => {
        setPhoto(category.link ?? "")
        setSelectedCategory(category)
        if (isMobile) window.scrollTo({top: 0, behavior: "smooth"})
    }

    const uploadPhoto = async (e) => {
        setPhoto("loading")

        const formData = new FormData()
        formData.append("file", e.target.files[0])
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
            setPhoto(data.content)
        }
    }

    const deletePhoto = async () => {
        if (photo.startsWith("uploads/ljdp-uploaded_file-")) {
            const request = await fetch("/api/photo/deletePhoto", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({link: photo}),
            })

            if (request.status === 200) {
                setPhoto("")

                let dataCopy = [...categories]
                dataCopy[categories.findIndex(category => category.id === selectedCategory.id)].link = null
                setCategories(dataCopy)
            }
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
                                {photo !== "" && photo !== "loading"  ?
                                    <>
                                        <img src={`/${photo}`} alt="Photo"/>
                                        {photo !== "loading" && <Button rounded severity="danger" label="Supprimer le fichier" onClick={() => deletePhoto(photo)}/>}
                                    </>
                                    :
                                    <div id="drop-area" className={photo === "loading" && "disabled"}>
                                        <i className={photo !== "loading" ? "pi pi-cloud-upload" : "pi pi-spin pi-spinner"} />
                                        <span>{photo !== "loading" ? "Clique ou dépose ton fichier ici" : "Envoi en cours..."}</span>
                                        <input className={photo === "loading" && "disabled"} id="file" type="file" disabled={photo === "loading"} multiple={false} accept="image/*" onChange={uploadPhoto}/>
                                    </div>
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