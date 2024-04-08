import {Avatar} from "primereact/avatar"
import {Button} from "primereact/button"
import {io} from "socket.io-client"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"
import {useState} from "react"

const socket = io.connect("http://192.168.1.12:4000")

export default function Game(props) {
    const [gameData, setGameData] = useState(props.gameData)
    const [questionMode, setQuestionMode] = useState(true)
    const [propositionChecked, setPropositionChecked] = useState(null)
    const [preventValidation, setPreventValidation] = useState(false)
    const [category, setCategory] = useState(0)
    const [photo, setPhoto] = useState(0)
    const router = useRouter()
    const isMobile = useMediaQuery({maxWidth: 1280})

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

                setPropositionChecked(null)
                setPreventValidation(false)
            }
        })
    }

    const getSolution = async () => {
        const request = await fetch("/api/game/getSolution", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: props.user.id, accessCode: props.accessCode}),
        })

        if (request.status === 200) {
            const data = await request.json()
            setGameData(data)
            setCategory(0)
            setPhoto(0)
            setQuestionMode(false)
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
                const request = await fetch("/api/response/addResponse", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({user: props.user.id, accessCode: props.accessCode, photo: gameData.categories[category].photos[photo].id, response: propositionChecked}),
                })

                if (request.status === 200) {
                    handleNext(getSolution)
                }
            }
        } else {
            handleNext(getScoresView)
        }
    }

    return (<main id="game">
            <h1>{gameData.categories[category].title}</h1>

            <div id="container">
                <section id="photo-container">
                    <img src={gameData.categories[category].photos[photo].link} alt="Photo"/>
                </section>

                <section id="propositions-container">
                    <div id="propositions">
                        {questionMode ?
                            gameData.propositions.map(proposition =>
                                <div key={proposition.id} className={`proposition${!preventValidation ? " hover" : ""}${propositionChecked === proposition.id ? " checked" : ""}`} onClick={() => !preventValidation && setPropositionChecked(proposition.id)}>
                                    <Avatar image={proposition.profilePicture} size={isMobile ? "large" : "xlarge"} shape="circle"/>
                                    <div className="username-wrapper">
                                        <span className="displayedname">{proposition.username}</span>
                                        <span className="username">{proposition.displayedName}</span>
                                    </div>
                                </div>
                            )
                            :
                            <>
                                <div>
                                    <span>Tu as sélectionné :</span>
                                    <Button text raised disabled severity={gameData.categories[category].photos[photo].response.id === gameData.categories[category].photos[photo].solution.id ? "success" : "danger" } label={gameData.categories[category].photos[photo].response.displayedName} icon={(options) => <img src={gameData.categories[category].photos[photo].response.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                </div>

                                <div>
                                    <span>Et la bonne réponse était :</span>
                                    <Button text raised disabled severity="success" label={gameData.categories[category].photos[photo].solution.displayedName} icon={(options) => <img src={gameData.categories[category].photos[photo].solution.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                </div>
                            </>
                        }
                    </div>

                    <div id="validate-container">
                        <Button label={preventValidation ? "En attente des autres joueurs..." : "Valider"} disabled={preventValidation || propositionChecked === null} onClick={() => handleValidation()} rounded/>
                    </div>
                </section>
            </div>
        </main>
    )
}