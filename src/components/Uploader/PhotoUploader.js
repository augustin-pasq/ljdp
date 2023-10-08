import React, {useEffect, useRef, useState} from "react"
import {Button} from "primereact/button"
import {Toast} from "primereact/toast"

export default function PhotoUploader(props) {
    const [photo, setPhoto] = useState()
    const [photoLink, setPhotoLink] = useState("")
    const toastSuccess = useRef(null)
    const toastErr = useRef(null)
    const toastEmpty = useRef(null)

    useEffect(() => {
        setPhoto(null)
        setPhotoLink(props.photo)
    }, [props.category.categoryId])

    const uploadPhoto = async () => {
        if (photo === null) {
            toastEmpty.current.show({severity:"warn", summary: "Aucun fichier n'a été chargé", detail:"Clique sur la zone correspondante ou dépose-y un fichier pour l'uplaoder. ", life: 3000})
        } else {
            const formData = new FormData()
            formData.append("file", photo)
            formData.append("category", props.category.categoryId)
            formData.append("user", props.user)
            formData.append("game", props.category.game)

            const results = await fetch("/api/photo/addPhoto", {
                method: "POST",
                body: formData
            })

            switch(results.status) {
                case 200:
                    toastSuccess.current.show({severity:"success", summary: "Ton fichier a été uplaodé !", detail:"Tu pourras toujours le changer ou le supprimer plus tard.", life: 3000})
                    props.updateCheck(props.category.categoryId, true)
                    break
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        }
    }

    const deletePhoto = async () => {
        if (photoLink.startsWith("uploads/ljdp-uploaded_file-")) {
            const results = await fetch("/api/photo/deletePhoto", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({link: props.photo}),
            })

            switch(results.status) {
                case 200:
                    const content = await results.json()
                    setPhotoLink(content.link)

                    toastSuccess.current.show({severity:"success", summary: "Le fichier a été supprimé !", detail:"Tu pourras toujours en réuploader un plus tard.", life: 3000})
                    props.updateCheck(props.category.categoryId, false)
                    break
                case 500:
                    toastErr.current.show({severity:"error", summary: "Erreur", detail:"Une erreur s\'est produite. Réessaye pour voir ?", life: 3000})
                    break
            }
        }

        setPhoto(null)
        setPhotoLink("")
    }

    return (
        <>
            {photoLink === "" ?
                <div className="flex flex-column align-items-center justify-content-center w-full h-full photo-drop-area">
                    <i className="pi pi-upload p-5 text-300 surface-50 text-4xl border-circle"></i>
                    <span className="p-3 text-400 text-center">Clique ou dépose ton fichier ici</span>
                    <input className="photo-input" id="file" type="file" multiple={false} accept="image/*" onChange={(e) => {setPhoto(e.target.files[0]);  setPhotoLink(URL.createObjectURL(e.target.files[0]))}}/>
                </div>
            :
                <div className="flex flex-column align-items-center justify-content-center w-full h-full photo-area">
                    <img className="uploaded-image" src={photoLink} alt="Fichier Joueur LJDP"/>
                </div>
            }

            {
                (photoLink === "" &&
                    <div className="flex gap-3 w-full">
                        <Button className="w-full" label="Uploader le fichier" onClick={uploadPhoto}/>
                    </div>
                ) ||
                (photoLink.startsWith("uploads/ljdp-uploaded_file-") &&
                    <div className="flex gap-3 w-full">
                        <Button className="w-full" severity="danger" label="Supprimer le fichier" onClick={() => deletePhoto(props.photo)}/>
                    </div>
                ) ||
                (photoLink.startsWith("blob:") &&
                    <div className="flex gap-3 w-full">
                        <Button className="w-6" severity="danger" label="Supprimer le fichier" onClick={() => deletePhoto(props.photo)}/>
                        <Button className="w-6" label="Uploader le fichier" onClick={uploadPhoto}/>
                    </div>
                )
            }

            <Toast ref={toastSuccess}/>
            <Toast ref={toastErr}/>
            <Toast ref={toastEmpty}/>
        </>
    )
}