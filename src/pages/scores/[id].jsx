import {Badge} from "primereact/badge"
import Categories from "@/components/Categories"
import {checkIfUserIsLoggedIn, withSessionSsr} from "../../../utils/ironSession"
import {getCategories} from "../../../utils/getCategories"
import Navbar from "@/components/Navbar"
import PlayerCard from "@/components/PlayerCard"
import Photo from "@/components/Photo";
import {Skeleton} from "primereact/skeleton"
import {useEffect, useState} from "react"
import {useMediaQuery} from "react-responsive"
import {useRouter} from "next/router"

export default function Scores(props) {
    const mediaQuery = useMediaQuery({maxWidth: 768})
    const mediaQueryMedium = useMediaQuery({minWidth: 768, maxWidth: 1200})
    const router = useRouter()
    const [categories, setCategories] = useState(null)
    const [isMobile, setIsMobile] = useState(true)
    const [isTablet, setIsTablet] = useState(false)
    const [photos, setPhotos] = useState(null)
    const [rendered, setRendered] = useState(false)
    const [scores, setScores] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        setIsMobile(mediaQuery)
        setIsTablet(mediaQueryMedium)

        if (!rendered) {
            getCategories(parseInt(router.query.id), router)
                .then(result => {
                    if (result !== null) {
                        setCategories(result.categories)

                        getScores(result.game).then(result => setScores(result))

                        setRendered(true)
                    }
                })
        }
    }, [mediaQuery, mediaQueryMedium])

    async function getScores(game) {
        const request = await fetch("/api/participant/getScores", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({game: game.id}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    const selectCategory = (category) => {
        getPhotos(category).then(result => {
            setPhotos(result)
            setSelectedCategory(category)
            if (isMobile || isTablet) window.scrollTo({top: 0, behavior: "smooth"})
        })
    }

    const getPhotos = async (category) => {
        const request = await fetch("/api/photo/getPhotos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({category: category.id}),
        })

        if (request.status === 200) {
            const data = await request.json()
            return data.content
        }
    }

    const playersSection = (width) => {
        return(
            <section className="players-container" style={{width: width}}>
                <span className="section-header">Classement</span>
                <ul>
                    {scores !== null ?
                        scores.map((score, index) => {
                            return (
                                <li key={index + 1} className="playercard_container" style={{padding: isMobile ? "0.75rem 1rem" : "1rem"}}>
                                    <Badge value={index + 1} size="large" style={{color: "black", border: `1px solid ${index === 0 ? "#AB7A1B" : (index === 1 ? "#838280" : (index === 2 ? "#75563B" : ""))}`, background: index === 0 ? "#EDB738" : (index === 1 ? "#D3D3D9" : (index === 2 ? "#C1834E" : ""))}}/>
                                    <PlayerCard user={score.User} isMobile={isMobile} complementaryData={`${score.score} point${score.score > 1 ? "s" : ""}`} />
                                </li>
                            )
                        })
                        :
                        <>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                            <Skeleton height="6rem" borderRadius="100rem"/>
                        </>
                    }
                </ul>
            </section>
        )
    }

    const categoriesSection = (width) => {
        return(
            <section className="list-container" style={{width: width}}>
                <span className="section-header">Catégories</span>
                <Categories buttonIcon="pi pi-arrow-right" categories={categories} clickable handleAction={selectCategory} page="scores" selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            </section>
        )
    }

    return (
        <>
            <Navbar user={props.user} isMobile={isMobile}/>
            <main id="dashboard">
                <h1 id="page-title">Récap' de la partie</h1>

                <div id="container" style={{flexDirection: isMobile ? "column" : "row"}}>
                    {isTablet ?
                        <div id="sections-wrapper" style={{width: "50%"}}>
                            {playersSection("100%")}
                            {categoriesSection("100%")}
                        </div>
                        :
                        <>
                            {playersSection("30%")}
                            {categoriesSection("36%")}
                        </>
                    }

                    <section id="photos-container" style={{width: isTablet ? "50%" : "34%"}}>
                        {selectedCategory ?
                            <ul>
                                {photos.length > 0 ?
                                    photos.map(photo =>
                                        <li className="photo">
                                            <div className="playercard-wrapper">
                                                <PlayerCard user={photo.User} isMobile={isMobile} />
                                            </div>
                                            <Photo photo={{type: photo.Category.type, link: photo.link}} />
                                        </li>
                                    )
                                    :
                                    <span className="side-container instructions">Aucune photo n'a été envoyée pour cette catégorie...</span>
                                }
                            </ul>
                            :
                            <span className="side-container instructions">Sélectionne une catégorie pour voir les photos des joueurs.</span>
                        }
                    </section>
                </div>
            </main>
        </>
    )
}

export const getServerSideProps = withSessionSsr(checkIfUserIsLoggedIn)