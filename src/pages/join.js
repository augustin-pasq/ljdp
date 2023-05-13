import React from "react";
import AccessCodeForm from "@/pages/Components/AccessCodeForm";

export default function GameEdit() {
    return (
        <AccessCodeForm subtitle="Entre ici le code qu'on t'a envoyé pour jouer avec tes amis :" button="Accéder à la partie" redirect="/home" action="play"/>
    )
}