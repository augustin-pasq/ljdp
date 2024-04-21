import {Badge} from "primereact/badge"
import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import {io} from "socket.io-client"
import Navbar from "@/components/Navbar"
import PlayerCard from "@/components/PlayerCard"
import {useEffect, useRef, useState} from "react"
import {useFormik} from "formik"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

const socket = io.connect("http://192.168.1.12:4000")

export default function Dashboard(props) {
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [categories, setCategories] = useState(props.categories)
    const [hasJoined, setHasJoined] = useState(false)
    const [layoutSettings, setLayoutSettings] = useState({})
    const [lastPerformedAction, setLastPerformedAction] = useState("")
    const [participants, setParticipants] = useState(props.participants !== undefined ? props.participants.map(participant => { return ({...participant.User, hasJoined: participant.hasJoined, hasPhotos: true}) }) : [])
    const [photo, setPhoto] = useState("")
    const [photos, setPhotos] = useState([])
    const [players, setPlayers] = useState(participants !== undefined ? participants.filter(participant => participant.hasJoined) : [])
    const [rendered, setRendered] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const categoriesNode = useRef(null)
    const mainNode = useRef(null)
    const router = useRouter()
    const isMobile = useMediaQuery({maxWidth: 1280})

    useEffect(() => {
        if (!rendered) {
            switch(props.page) {
                case "/edit":
                    setLayoutSettings({
                        title: "Éditer la partie",
                        listContainerWidth: "66%",
                    })
                    break
                case "/upload":
                    setLayoutSettings({
                        title: "Uploader des photos",
                        listContainerWidth: "60%",
                    })
                    break
                case "/join":
                    setLayoutSettings({
                        title: "Rejoindre une partie",
                        listContainerWidth: "36%",
                    })
                    break
                case "/scores":
                    setLayoutSettings({
                        title: "Récap' de la partie",
                        listContainerWidth: "36%",
                    })
                    break
            }

            setRendered(true)
        } else if (lastPerformedAction === "create") {
            (isMobile ? mainNode : categoriesNode).current.scrollTo({top: (!isMobile ? mainNode : categoriesNode).current.scrollHeight + 64, behavior: "smooth"})
        }

        socket.on("userHasJoined", (data) => {
            if (participants.find(participant => participant.id === data.user.id) === undefined) {
                setParticipants([...participants, data.user])
            }
            setPlayers([...players, data.user])
        })

        socket.on("gameHasBeenLaunched", async () => {
            await router.push({
                pathname: "/play", query: {accessCode: props.accessCode},
            }, "/play")
        })
    }, [categories, players])

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
            const request = await (await fetch("/api/category/createCategory", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: data.title, accessCode: props.accessCode}),
            }))

            if(request.status === 200) {
                const data = await request.json()
                setCategories([...categories, {id: data.content.id, title: data.content.title}])
                setLastPerformedAction("create")
            }

            formik.resetForm()
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const selectCategory = (category, page) => {
        switch(page) {
            case "/upload":
                setPhoto(category.link ?? "")
                setSelectedCategory(category)
                break
            case "/scores":
                fetch("/api/photo/getPhotos", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({category: category.id, user: props.user.id}),
                }).then(result => {
                    if (result.status === 200) {
                        result.json().then(data => {
                            setPhotos(data.content)
                            setSelectedCategory(category)
                            mainNode.current.scrollTo({top: categoriesNode.current.scrollHeight + categories.length * 92, behavior: "smooth"})
                        })
                    }
                })
        }
    }

    const deleteCategory = async (id) => {
        const request = await fetch("/api/category/deleteCategory", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id}),
        })

        if(request.status === 200) {
            setCategories(categories.filter(category => category.id !== id))
            setLastPerformedAction("delete")
        }
    }

    const uploadPhoto = async (e) => {
        setPhoto(URL.createObjectURL(e.target.files[0]))

        const formData = new FormData()
        formData.append("file", e.target.files[0])
        formData.append("category", selectedCategory.id)
        formData.append("user", props.user.id)
        formData.append("accessCode", props.accessCode)

        const request = await fetch("/api/photo/addPhoto", {
            method: "POST", body: formData
        })

        if (request.status === 200) {
            const data = await request.json()
            setPhoto(data.content.link)

            let dataCopy = [...categories]
            dataCopy[categories.findIndex(category => category.id === selectedCategory.id)].link = data.content.link
            setCategories(dataCopy)
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

    const handleJoin = async () => {
        const request = await fetch("/api/participant/setHasJoined", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user.id, accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            socket.emit("setHasJoined", data.content)
            setHasJoined(true)
        }
    }

    const handleLaunch = () => {
        handleJoin().then(() => socket.emit("launchGame", {accessCode: props.accessCode}))
    }

    return (
        <>
            <Navbar user={props.user}/>
            <main id="dashboard" ref={mainNode}>
                <h1>{layoutSettings.title}</h1>

                <div id="container" style={{flexDirection: (props.page === "/join" || props.page === "/scores") && isMobile ? "column" : ""}}>
                    {{
                        "/join":
                            <section id="instructions-container" style={{width: "34%"}}>
                                <div className="side-container">
                                    <span id="title">Voici le code d'accès de la partie :</span>
                                    <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={props.accessCode} onClick={() => {navigator.clipboard.writeText(`${props.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                                    <div id="links-container">
                                        <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                                        <span><a href="https://ljdp.augustinpasquier.fr/join" target="_blank">ljdp.augustinpasquier.fr/join</a> pour commencer la partie</span>
                                        <small>(Les joueurs n'ayant pas envoyé de photos peuvent quand même participer.)</small>
                                    </div>
                                </div>

                                <div className="side-down-container">
                                    <Button label={hasJoined ? "En attente du lancement de la partie..." : props.gameOwner === props.user.id ? "Lancer la partie" : "Rejoindre"} rounded disabled={hasJoined} onClick={props.gameOwner === props.user.id ? handleLaunch : handleJoin}/>
                                </div>
                            </section>,

                        "/scores":
                            <section className="players-container" style={{width: "30%"}}>
                                <span className="section-header">Classement</span>
                                <ul>
                                    {props.scores && props.scores.map((score, index) => {
                                        return (
                                            <li key={index + 1} className="playercard_container" style={{padding: isMobile ? "0.75rem 1rem" : "1rem"}}>
                                                <Badge value={index + 1} size="large" style={{color: "black", border: `1px solid ${index === 0 ? "#AB7A1B" : (index === 1 ? "#838280" : (index === 2 ? "#75563B" : ""))}`, background: index === 0 ? "#EDB738" : (index === 1 ? "#D3D3D9" : (index === 2 ? "#C1834E" : ""))}}/>
                                                <PlayerCard user={score.User} isMobile={isMobile} complementaryData={`${score.score} point${score.score > 1 ? "s" : ""}`} />
                                            </li>
                                        )
                                    })}
                                </ul>
                            </section>
                    }[props.page]}

                    <section className="list-container" style={{width: layoutSettings.listContainerWidth}}>
                        {props.page === "/edit" &&
                            <form onSubmit={formik.handleSubmit}>
                                <InputText id="title" className={isFormFieldInvalid("title") ? "p-invalid" : ""} name="title" placeholder="Titre" value={formik.values.title} onChange={formik.handleChange}/>
                                <Button type="submit" icon="pi pi-plus" rounded/>
                            </form>
                        }

                        <ul ref={categoriesNode}>
                            {(props.page === "/join" || props.page === "/scores") && <span className="section-header">Catégories</span>}
                            {categories.map(category => {
                                return (
                                    <li key={category.id} className={`category${(props.page === "/upload" || props.page === "/scores") ? " hover" : ""}`} onClick={() => (props.page === "/upload" || props.page === "/scores") && selectCategory(category, props.page)}>
                                        <span className="title">{category.title}</span>
                                        {{
                                            "/edit": <Button icon="pi pi-trash" rounded onClick={() => deleteCategory(category.id)}/>,
                                            "/upload": <Button icon={`pi ${category.link === null ? "pi-cloud-upload" : "pi-check"}`} rounded severity={category.link === null ? "" : "success"} onClick={() => selectCategory(category, props.page)}/>,
                                            "/scores": <Button icon="pi pi-arrow-right" rounded onClick={() => selectCategory(category, props.page)}/>,
                                        }[props.page]}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>

                    {{
                        "/edit":
                            <section id="instructions-container" className="side-container" style={{width: "33%"}}>
                                <span id="title">Voici le code d'accès de la partie :</span>
                                <InputText tooltip={buttonTooltip} tooltipOptions={{position: "right"}} value={props.accessCode} onClick={() => {navigator.clipboard.writeText(`${props.accessCode}`).then(() => {setButtonTooltip("Copié !")})}}/>
                                <div id="links-container">
                                    <span id="instruction">Partage-le avec tes amis, et rendez-vous sur :</span>
                                    <span><a href="https://ljdp.augustinpasquier.fr/upload" target="_blank">ljdp.augustinpasquier.fr/upload</a> pour uploader des photos</span>
                                    <span><a href="https://ljdp.augustinpasquier.fr/join" target="_blank">ljdp.augustinpasquier.fr/join</a> pour commencer la partie</span>
                                </div>
                            </section>,

                        "/upload":
                            <section id="uploader-container" className="side-container" style={{width: "40%"}}>
                                {selectedCategory ?
                                    <>
                                        {photo === "" ?
                                            <div id="drop-area">
                                                <i className="pi pi-cloud-upload"></i>
                                                <span>Clique ou dépose ton fichier ici</span>
                                                <input className="photo-input" id="file" type="file" multiple={false} accept="image/*" onChange={uploadPhoto}/>
                                            </div>
                                            :
                                            <>
                                                <img src={photo} alt="Photo"/>
                                                <Button rounded severity="danger" label="Supprimer le fichier" onClick={() => deletePhoto(photo)}/>
                                            </>
                                        }
                                    </>
                                    :
                                    <span id="instructions">Sélectionne une catégorie pour uploader un fichier.</span>
                                }
                            </section>,

                        "/join":
                            <section className="players-container" style={{width: "30%"}}>
                                <span className="section-header">Participants</span>
                                <ul>
                                    {participants.map(participant => {
                                        return (
                                            <li key={participant.id} className={`playercard_container ${players.find(player => player.id === participant.id) !== undefined ? "background-white" : "background-dark"}`}>
                                                <PlayerCard user={participant} isMobile={isMobile} icon={participant.hasPhotos ? "pi-images" : ""} />
                                            </li>
                                        )
                                    })}
                                </ul>
                            </section>,

                        "/scores":
                            <section id="photos-container" style={{width: "34%"}}>
                                {selectedCategory ?
                                    <ul>
                                        {photos.map(photo =>
                                            <li className="photo">
                                                <div className="playercard-wrapper">
                                                    <PlayerCard user={photo} isMobile={isMobile} />
                                                </div>
                                                <img src={photo.link} alt="Photo"/>
                                            </li>
                                        )}
                                    </ul>
                                    :
                                    <span className="side-container instructions">Sélectionne une catégorie pour voir les photos des joueurs.</span>
                                }
                            </section>,
                    }[props.page]}
                </div>
            </main>
        </>)
}