import React, {useRef, useState} from "react"
import {ToggleButton} from "primereact/togglebutton"
import {Button} from "primereact/button"
import {Card} from "primereact/card"
import {Toast} from "primereact/toast";
import {useRouter} from "next/router";

export default function Game(props) {
    const wide = props.gameData.propositions.length > 4
    const [data, setData] = useState(props.gameData)
    const [questionMode, setQuestionMode] = useState(true)
    const [propositionChecked, setPropositionChecked] = useState("")
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [currentCategory, setCurrentCategory] = useState(data.categories[0])
    const [currentPhoto, setCurrentPhoto] = useState(data.categories[0].photos[0])
    const toastErr = useRef(null)
    const router = useRouter()

    const handleNext = (endFunction) => {
        if (currentCategory.photos[currentPhotoIndex + 1] !== undefined) {
            setCurrentPhoto(currentCategory.photos[currentPhotoIndex + 1])
            setCurrentPhotoIndex(currentPhotoIndex + 1)
        } else {
            if (data.categories[currentCategoryIndex + 1] !== undefined) {
                setCurrentCategory(data.categories[currentCategoryIndex + 1])
                setCurrentCategoryIndex(currentCategoryIndex + 1)
                setCurrentPhoto(data.categories[currentCategoryIndex + 1].photos[0])
                setCurrentPhotoIndex(0)
            } else {
                endFunction()
            }
        }
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
                setData(content)
                setCurrentCategory(content.categories[0])
                setCurrentCategoryIndex(0)
                setCurrentPhoto(content.categories[0].photos[0])
                setCurrentPhotoIndex(0)
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
        // TODO : this happens when everyone has answered
        if(questionMode) {
            if (propositionChecked !== "") {
                const results = await fetch("/api/response/addResponse", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({user: props.user, accessCode: props.accessCode, photo: currentPhoto.id, response: propositionChecked.id}),
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

            setPropositionChecked("")
        } else {
            handleNext(getScoresView)
        }
    }

    return (
        <>
            <Card className="shadow-7 border-round-4xl px-7 pt-6 pb-4 flex align-items-center justify-content-center">
                <h1 className="text-6xl text-center mt-0 pb-8">{currentCategory.title}</h1>
                <div className="flex flex-column column-gap-9 md:flex-row md:row-gap-8">
                    <div id="game-photo-container">
                        <img src={currentPhoto.link} alt="Photo"/>
                    </div>
                    <div className={`flex flex-column justify-content-around pr-5 ${wide ? "w-37rem" : "w-30rem"}`}>
                        <div className={`button-group m-0 gap-4 ${questionMode ? `grid ${(wide ? "justify-content-center" : "flex-column")}` : "h-full justify-content-around"}`}>
                            {questionMode ?
                                data.propositions.map((proposition, index) => {
                                    return(
                                        data.propositions.length <= 4 ?
                                            <ToggleButton key={index} className="button-proposition" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                            :
                                            <ToggleButton key={index} className="button-proposition small" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                    )
                                })
                                :
                                <div className="flex flex-column gap-7">
                                    <div className="flex flex-column gap-4">
                                        <span className="text-xl font-bold text-center">Tu as sélectionné :</span>
                                        <Button text raised disabled className="button-proposition" severity={currentPhoto.response.id === currentPhoto.solution.id ? "success" : "danger" } label={currentPhoto.response.displayedName} icon={(options) => <img src={currentPhoto.response.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                    </div>

                                    <div className="flex flex-column gap-4">
                                        <span className="text-xl font-bold text-center">Et la bonne réponse était :</span>
                                        <Button text raised disabled className="button-proposition" severity="success" label={currentPhoto.solution.displayedName} icon={(options) => <img src={currentPhoto.solution.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} alt="Photo de profil du joueur" />
                                    </div>
                                </div>
                            }
                        </div>

                        <Button className="button-proposition text-center w-full" label="Valider" onClick={() => handleValidation()}/>
                    </div>
                </div>
            </Card>

            <Toast ref={toastErr}/>
        </>
    )
}