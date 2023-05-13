import React from "react";
import AccessCodeDispatcher from "@/pages/Components/AccessCodeDispatcher";

export default function Join() {
    return (
        <AccessCodeDispatcher subtitle="Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :" button="Accéder à la partie" redirect="/home" action="play"/>
    )
}