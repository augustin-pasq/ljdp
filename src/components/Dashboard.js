import {Avatar} from "primereact/avatar"
import {Button} from "primereact/button"
import {InputText} from "primereact/inputtext"
import {io} from "socket.io-client"
import Navbar from "@/components/Navbar"
import React, {useEffect, useRef, useState} from "react"
import {useFormik} from "formik"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router";

const socket = io.connect("http://192.168.1.12:4000")

export default function Dashboard(props) {
    const participants = props.participants !== undefined ? props.participants : []
    const [buttonTooltip, setButtonTooltip] = useState("Copier")
    const [categories, setCategories] = useState(props.categories)
    const [hasJoined, setHasJoined] = useState(false)
    const [layoutSettings, setLayoutSettings] = useState({})
    const [lastPerformedAction, setLastPerformedAction] = useState("")
    const [photo, setPhoto] = useState("")
    const [players, setPlayers] = useState(participants !== undefined ? participants.filter(participant => participant.hasJoined).map(participant => participant.User) : [])
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
                        listContainerWidth: "47%",
                    })
                    break
            }

            setRendered(true)
        } else if (lastPerformedAction === "create") {
            (isMobile ? mainNode : categoriesNode).current.scrollTo({top: (!isMobile ? mainNode : categoriesNode).current.scrollHeight + 64, behavior: "smooth"})
        }

        socket.on("userHasJoined", (data) => {
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

    const selectCategory = (category) => {
        async function getPhoto() {
            const request = await fetch("/api/photo/getPhoto", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({category: category.id, user: props.user.id}),
            })

            if (request.status === 200) {
                const data = await request.json()
                return data.content.link ?? ""
            }
        }

        getPhoto()
            .then((result) => {
                setPhoto(result)
                setSelectedCategory(category)
            })
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
            <main id="gamemaker" ref={mainNode}>
                <h1>{layoutSettings.title}</h1>

                <div id="container" style={{flexDirection: props.page === "/join" && isMobile ? "column" : ""}}>
                    {props.page === "/join" &&
                        <section id="instructions-container" style={{width: "31%"}}>
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
                        </section>
                    }

                    <section className="list-container" style={{width: layoutSettings.listContainerWidth}}>
                        {props.page === "/edit" &&
                            <form onSubmit={formik.handleSubmit}>
                                <InputText id="title" className={isFormFieldInvalid("title") ? "p-invalid" : ""} name="title" placeholder="Titre" value={formik.values.title} onChange={formik.handleChange}/>
                                <Button type="submit" icon="pi pi-plus" rounded/>
                            </form>
                        }

                        <li ref={categoriesNode}>
                            {props.page === "/join" && <span className="header">Catégories</span>}
                            {categories.map(category => {
                                return (
                                    <ul key={category.id} onClick={() => props.page === "/upload" && selectCategory(category)}>
                                        <span className="title">{category.title}</span>
                                        {{
                                            "/edit": <Button icon="pi pi-trash" rounded onClick={() => deleteCategory(category.id)}/>,
                                            "/upload": <Button className="cursor-pointer" icon={`pi ${category.link === null ? "pi-cloud-upload" : "pi-check"}`} rounded severity={category.link === null ? "" : "success"} onClick={() => selectCategory(category)}/>,
                                            "/join": <></>
                                        }[props.page]}
                                    </ul>
                                )
                            })}
                        </li>
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
                                {selectedCategory ? <>
                                    {photo === "" ? <div id="drop-area">
                                        <i className="pi pi-cloud-upload"></i>
                                        <span>Clique ou dépose ton fichier ici</span>
                                        <input className="photo-input" id="file" type="file" multiple={false} accept="image/*" onChange={uploadPhoto}/>
                                    </div> : <>
                                        <img src={photo} alt="Fichier Joueur LJDP"/>
                                        <Button rounded severity="danger" label="Supprimer le fichier" onClick={() => deletePhoto(photo)}/>
                                    </>}
                                </> : <span id="instructions">Sélectionne une catégorie pour uploader un fichier.</span>}
                            </section>,

                        "/join":
                            <section className="list-container" style={{width: "22%"}}>
                                <span className="header">Participants</span>
                                <li>
                                    {participants.map(participant => {
                                        return (
                                            <ul key={participant.User.id} className={`participant ${players.find(player => player.id === participant.User.id) !== undefined ? "background-white" : "background-dark"}`}>
                                                <Avatar image={participant.User.profilePicture} size="large" shape="circle"/>
                                                <div className="username-wrapper">
                                                    <span className="username">{participant.User.username}</span>
                                                    <span>{participant.User.displayedName}</span>
                                                </div>
                                            </ul>
                                        )
                                    })}
                                </li>
                            </section>
                    }[props.page]}
                </div>
            </main>
        </>)
}