import React from "react"
import {Card} from "primereact/card"
import FileUploader from "@/pages/Components/FileUploader"

export default function Uploader(props) {
    return (
        <Card className="px-3">
            <h1 className="text-6xl text-center p-8">Uploader mes photos</h1>
            <div className="grid justify-content-center">
                {props.categories.map((category, index) =>
                    ((category.type === "Photo" || category.type === "Vidéo") && <FileUploader key={index} accessCode={props.accessCode} label={category.title}></FileUploader>)
                )}
            </div>
        </Card>
    )
}