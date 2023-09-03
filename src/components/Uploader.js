import React, {useRef, useState} from "react"
import {Card} from "primereact/card"
import PhotoUploader from "@/components/PhotoUploader"
import {Toast} from "primereact/toast"
import {Button} from "primereact/button"

export default function Uploader(props) {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [photo, setPhoto] = useState(null)
    const toastErr = useRef(null)

    const selectCategory = (category) => {
        async function getPhoto() {
            const results = await fetch("/api/photo/getPhoto", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({category: category.categoryId, user: props.user}),
            })

            switch(results.status) {
                case 200:
                    const content = await results.json()
                    return content.link
                case 404:
                    return ""
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        }

        getPhoto()
            .then((content) => { setPhoto(content); setSelectedCategory(category) })
            .catch(error => console.error(error))
    }
    
    const updateCheck = (categoryId, display) => {
        document.querySelector(`#\\3${categoryId.toString().charAt(0)} ${categoryId.toString().slice(1)} > span > button`).style.visibility = display ? "visible" : "hidden"
    };

    return (
        <>
            <Card className="panel-size shadow-7 border-round-4xl px-4 py-2 flex align-items-center justify-content-center">
                <h1 className="text-6xl text-center pb-4">Uploader mes photos</h1>
                <div className="grid md:flex-row flex-column">
                    <div className="col-7 pr-6 pl-3 py-3 flex-column justify-content-start">
                        <h2 className="text-3xl text-center pb-2">Catégories</h2>
                        {props.categories && props.categories.length > 0 &&
                            <div className="flex flex-column gap-3 p-3 no-scroll" id="photos-container">
                                {props.categories.map((category, index) => {
                                    return (
                                        <div key={index} id={category.categoryId} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center" onClick={() => selectCategory(category)}>
                                            <span className="col-8">{category.title}</span>
                                            <span className="col-3">{category.type}</span>
                                            <span className="col-1"><Button className="cursor-pointer" icon="pi pi-check" rounded disabled outlined severity="success" style={{visibility: category.link !== null ? 'visible' : 'hidden' }} /></span>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                    </div>

                    <div className={`col-5 pr-3 pl-6 py-3 flex flex-column full-height-card-upload align-items-center ${selectedCategory ? "justify-content-between" : ""}`}>
                        <h2 className="text-3xl text-center pb-2">Ma photo</h2>
                        {
                            selectedCategory ?
                                <PhotoUploader category={selectedCategory} photo={photo} user={props.user} updateCheck={updateCheck}/>
                                :
                                <div className="flex flex-column align-items-center justify-content-center w-full h-full">
                                    <i className="pi pi-image p-4 text-400 text-8xl"></i>
                                    <span className="p-3 text-500 text-2xl text-center">Sélectionne une catégorie pour uploader un fichier.</span>
                                </div>
                        }
                    </div>
                </div>
            </Card>

            <Toast ref={toastErr}/>
        </>
    )
}