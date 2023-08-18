import React from "react"
import AccessCodeDispatcher from "@/components/AccessCodeDispatcher"

export default function Join(props) {
    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :" button="Accéder à la partie" user={props.user} redirect="/home" action="play"/>
    )
}