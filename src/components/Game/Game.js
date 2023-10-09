import React, {useRef, useState} from "react"
import {ToggleButton} from "primereact/togglebutton"
import {Button} from "primereact/button"
import {Card} from "primereact/card"
import {Toast} from "primereact/toast";

export default function Game(props) {
    const [propositionChecked, setPropositionChecked] = useState("")
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [currentCategory, setCurrentCategory] = useState(props.gameData.categories[0])
    const [currentPhoto, setCurrentPhoto] = useState(props.gameData.categories[0].photos[0])
    const toastErr = useRef(null)

    const handleValidation = async () => {
        // TODO : this happens when everyone has answered
        if (propositionChecked !== "") {
            const results = await fetch("/api/response/addResponse", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: props.user, accessCode: props.accessCode, photo: currentPhoto.id, response: propositionChecked.id}),
            })

            switch(results.status) {
                case 200:
                    if (currentCategory.photos[currentPhotoIndex + 1] !== undefined) {
                        setCurrentPhoto(currentCategory.photos[currentPhotoIndex + 1])
                        setCurrentPhotoIndex(currentPhotoIndex + 1)
                    } else {
                        if (props.gameData.categories[currentCategoryIndex + 1] !== undefined) {
                            setCurrentCategory(props.gameData.categories[currentCategoryIndex + 1])
                            setCurrentCategoryIndex(currentCategoryIndex + 1)
                            setCurrentPhoto(props.gameData.categories[currentCategoryIndex + 1].photos[0])
                            setCurrentPhotoIndex(0)
                        } else {
                            // TODO : handle end game
                        }
                    }
                    break
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        } else {
            toastErr.current.show({severity:"warn", summary: "T'aurais pas oublié quelque chose ?", detail:"Tu dois choisir l'une des propositions !", life: 3000})
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
                    <div className={`flex flex-column justify-content-around pr-5 ${props.gameData.propositions.length <= 4 ? "w-30rem" : "w-37rem"}`}>
                        <div className={`button-group grid m-0 gap-4 ${props.gameData.propositions.length <= 4 ? "flex-column" : ""}`}>
                            {props.gameData.propositions.map((proposition, index) => {
                                return(
                                    props.gameData.propositions.length <= 4 ?
                                        <ToggleButton key={index} className="button-proposition" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                        :
                                        <ToggleButton key={index} className="button-proposition small" onLabel={proposition.displayedName} offLabel={proposition.displayedName} onIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} offIcon={(options) => <img src={proposition.profilePicture} alt="Photo de profil du joueur" {...options.iconProps} />} checked={proposition.displayedName === propositionChecked.displayedName} onChange={() => setPropositionChecked(proposition)} />
                                )
                            })}
                        </div>
                        <Button className="button-proposition text-center w-full" label="Valider" onClick={() => handleValidation()}/>
                    </div>
                </div>
            </Card>

            <Toast ref={toastErr}/>
        </>
    )
}