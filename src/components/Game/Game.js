import React, {useRef, useState} from "react"
import {ToggleButton} from "primereact/togglebutton"
import {Button} from "primereact/button"
import {Card} from "primereact/card"
import {Toast} from "primereact/toast";
import {useRouter} from "next/router";
import {io} from "socket.io-client";

const socket = io.connect("http://localhost:4000")

export default function Game(props) {
    const wide = props.gameData.propositions.length > 4
    const [gameData, setGameData] = useState(props.gameData)
    const [questionMode, setQuestionMode] = useState(true)
    const [propositionChecked, setPropositionChecked] = useState("")
    const [preventValidation, setPreventValidation] = useState(false)
    const [category, setCategory] = useState(0)
    const [photo, setPhoto] = useState(0)
    const [players, setPlayers] = useState([])
    const toastErr = useRef(null)
    const router = useRouter()

    const handleNext = (endFunction) => {
        socket.on("responseHasBeenAdded", (data) => {
            if(data.completed) {
                if (gameData.categories[category].photos[photo + 1] !== undefined) {
                    setPhoto(photo + 1)
                } else {
                    if (gameData.categories[category + 1] !== undefined) {
                        setCategory(category + 1)
                        setPhoto(0)
                    } else {
                        endFunction()
                    }
                }

                setPropositionChecked("")
                setPreventValidation(false)
            }
        })
    }

    const getSolution = async () => {
        const results = await fetch("/api/game/getSolution", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user, accessCode: props.accessCode}),
        })

        switch (results.status) {
            case 200:
                const content = await results.json()
                setGameData(content)
                setCategory(0)
                setPhoto(0)
                setQuestionMode(false)
                break
            case 500:
                toastErr.current.show({
                    severity: "error",
                    summary: "Erreur",
                    detail: "Une erreur s\'est produite. Réessaye pour voir ?",
                    life: 3000
                })
                break
        }
    }

    const getScoresView = async () => {
        await router.push({
            pathname: "/scores",
            query: {accessCode: props.accessCode},
        }, "/scores")
    }

    const handleValidation = async () => {
        setPreventValidation(true)

        if(questionMode) {
            if (propositionChecked !== "") {
                const results = await fetch("/api/response/addResponse", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({user: props.user, accessCode: props.accessCode, photo: gameData.categories[category].photos[photo].id, response: propositionChecked.id}),
                })

                switch(results.status) {
                    case 200:
                        handleNext(getSolution)
                        break
                    case 500:
                        toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                        break
                }
            } else {
                toastErr.current.show({severity:"warn", summary: "T'aurais pas oublié quelque chose ?", detail:"Tu dois choisir l'une des propositions !", life: 3000})
            }
        } else {
            handleNext(getScoresView)
        }
    }

    return (
        <>
            <Card className="panel-size shadow-7 border-round-4xl px-4 py-2 flex align-items-center justify-content-center">
                <h1 className="text-6xl text-center pb-4">{gameData.categories[category].title}</h1>
                <div className="grid md:flex-row flex-column">
                    <div className="col-7 pr-6 pl-3 py-3 flex-column justify-content-start">
                        <div className="flex flex-column gap-3 p-3" id="photos-container">
                            <img src={gameData.categories[category].photos[photo].link} alt="Photo"/>
                        </div>
                    </div>

                    <div className="col-5 pr-3 pl-6 py-3 flex flex-column full-height-card-upload align-items-center">
                        <div className={`flex flex-column justify-content-around pr-5 ${wide ? "w-37rem" : "w-30rem"}`}>
                            <div className={`button-group m-0 gap-4 ${questionMode ? `grid ${(wide ? "justify-content-center" : "flex-column")}` : "h-full justify-content-around"}`}>
                                {questionMode ?
                                    gameData.propositions.map((proposition, index) => {
                                        return(
                                            gameData.propositions.length <= 4 ?
                                                <ToggleButton key={index} className="button-proposition" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                                :
                                                <ToggleButton key={index} className="button-proposition small" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                        )
                                    })
                                    :
                                    <div className="flex flex-column gap-7">
                                        <div className="flex flex-column gap-4">
                                            <span className="text-xl font-bold text-center">Tu as sélectionné :</span>
                                            <Button text raised disabled className="button-proposition" severity={gameData.categories[category].photos[photo].response.id === gameData.categories[category].photos[photo].solution.id ? "success" : "danger" } label={gameData.categories[category].photos[photo].response.displayedName} icon={(options) => <img src={gameData.categories[category].photos[photo].response.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                        </div>

                                        <div className="flex flex-column gap-4">
                                            <span className="text-xl font-bold text-center">Et la bonne réponse était :</span>
                                            <Button text raised disabled className="button-proposition" severity="success" label={gameData.categories[category].photos[photo].solution.displayedName} icon={(options) => <img src={gameData.categories[category].photos[photo].solution.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                        </div>
                                    </div>
                                }
                            </div>

                            <Button className="button-proposition text-center w-full" label="Valider" disabled={preventValidation} onClick={() => handleValidation()}/>
                        </div>
                    </div>
                </div>
            </Card>

            <Toast ref={toastErr}/>
        </>
    )
}