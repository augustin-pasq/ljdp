import GameEditor from "@/pages/game/GameEditor";
import React, {useState, useEffect} from "react";
import CategoryItem from "@/pages/game/CategoryItem";
import {useRouter} from "next/router";

export default function GameEdit() {
    const [categories, setCategories] = useState([])
    const router = useRouter()

    useEffect(() => {
        async function getCategories() {
            return await (await fetch('/api/category/getCategories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({accessCode: router.query.accessCode}),
            })).json()
        }
        
        getCategories()
            .then((result) => {
                result.content.forEach((category, index) => result.content[index] = <CategoryItem id={category.id} title={category.title} type={category.type}/>)
                setCategories(result.content)
            })
            .catch(error => console.error(error))
    }, [])

    return (
        <GameEditor accessCode={router.query.accessCode} categories={categories}/>
    )
}