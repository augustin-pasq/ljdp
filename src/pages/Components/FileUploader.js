import React, {useEffect, useRef, useState} from "react"
import {Button} from "primereact/button"

export default function FileUploader(props) {
    const reference = useRef(null)
    const [composantToRender, setComposantToRender] = useState("emptyTemplate")
    const [file, setFile] = useState()

    useEffect(() => {
        if (composantToRender === "emptyTemplate") {
            reference.current.addEventListener('change', async function () {
                setFile(this.files[0])
                setComposantToRender("itemTemplate")

                const formData = new FormData()
                formData.append('file', this.files[0])

                await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })
            })
        }
    }, [composantToRender])

    const emptyTemplate = () => {
        return (
            <div className="col-4 flex flex-column align-items-center">
                <span className="text-2xl font-bold pb-4">{props.label}</span>
                <div className="file-drop-area flex align-items-center flex-column w-22rem">
                    <i className="pi pi-image mt-3 mb-1 p-5 text-300 surface-50 text-4xl border-circle"></i>
                    <span className="p-3 text-400 text-center">Clique ou dépose ton fichier ici</span>
                    <input className="file-input" id="file" type="file" multiple={false} accept="image/*" ref={reference}/>
                </div>
            </div>
        )
    }

    const itemTemplate = () => {
        return (
            <div className="col-4 flex flex-column align-items-center">
                <span className="text-2xl font-bold pb-4">{props.label}</span>
                <div className="flex align-items-center flex-row justify-content-evenly w-22rem h-full">
                    <img className="max-w-18rem max-h-12rem" src={URL.createObjectURL(file)} alt={file.name}/>
                    <Button icon="pi pi-times" rounded outlined severity="danger"
                            onClick={() => { setFile(null); setComposantToRender("emptyTemplate") }}/>
                </div>
            </div>
        )
    }

    return (
        (composantToRender === "itemTemplate") && itemTemplate() ||
        (composantToRender === "emptyTemplate") && emptyTemplate()
    )
}