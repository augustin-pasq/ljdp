import {Card} from "primereact/card"
import {Badge} from "primereact/badge"
import {Button} from "primereact/button"
import {useRouter} from "next/router"

export default function GameScores(props) {
    const router = useRouter()

    return (
        <Card className="panel-size shadow-7 border-round-4xl px-4 py-2 flex align-items-center justify-content-center">
            <h1 className="text-6xl text-center pb-4">Résultats de la partie</h1>
            <div className="grid md:flex-row flex-column">
                <div className="col-6 pr-6 pl-3 py-3 flex-column justify-content-start">
                    <h2 className="text-3xl text-center pb-2">Liste des catégories</h2>
                    <div className="flex flex-column gap-3 p-3 no-scroll" id="photos-container">
                        {props.categories.map(category => {
                            return (
                                <div key={category.id} id={category.categoryId} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center h-5rem">
                                    <span className="col-11">{category.title}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="col-6 pr-3 pl-6 py-3 flex-column justify-content-start">
                    <h2 className="text-3xl text-center pb-2">Scores</h2>
                    <div className="flex flex-column gap-3 p-3 no-scroll full-height-card-upload" id="photos-container">
                        {props.scores.map((score, index) => {
                            return (
                                <div key={index + 1} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center">
                                    <Badge className={`ml-3 w-auto border-circle ${index + 1 === 1 ? "background-first" : (index + 1 === 2 ? "background-second" : (index + 1 === 3 ? "background-third" : "no-background"))}`} value={index + 1} size="xlarge"/>
                                    <img alt="Photo de profil" className="col-1 ml-6 border-circle" src={score.User.profilePicture}/>
                                    <span className="col-8 text-xl pl-3 font-bold">{score.User.displayedName}</span>
                                    <span className="col-1 text-center">{score.score} point{score.score > 1 ? "s" : ""}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Button label="Retourner à l'accueil" type="submit" size="large" className="mt-5 align-self-center" rounded onClick={() => router.push("/home")}/>
        </Card>
    )
}