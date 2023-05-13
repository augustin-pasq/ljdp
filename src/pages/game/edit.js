import GameEditor from "@/pages/Components/GameEditor";
import React, {useState, useEffect} from "react";
import CategoryItem from "@/pages/Components/CategoryItem";
import {useRouter} from "next/router";
import AccessCodeForm from "@/pages/Components/AccessCodeForm";
import {withSessionSsr} from "../../../lib/ironSession";

export default function GameEdit() {
    const [accessCode, setAccessCode] = useState("")
    const [categories, setCategories] = useState([])
    const router = useRouter()

    useEffect(() => {
        if (router.query.accessCode !== undefined) setAccessCode(router.query.accessCode.toString())
        async function getCategories() {
            return await (await fetch('/api/category/getCategories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({accessCode: accessCode}),
            })).json()
        }
        
        getCategories()
            .then((result) => {
                result.content.forEach((category, index) => result.content[index] = <CategoryItem id={category.id} title={category.title} type={category.type}/>)
                setCategories(result.content)
            })
            .catch(error => console.error(error))
    }, [router.query.accessCode])

    return (
        accessCode === "" ?
            <AccessCodeForm subtitle="LJDP a besoin du code d'accès pour retrouver la partie :" button="Accéder au panneau d'édition" redirect="/game/edit" action="edit"/>
            :
            <GameEditor accessCode={accessCode} categories={categories}/>
    )
}

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req}) {
    let user = req.session.user;

    if (!user?.isLoggedIn) {
        return {
            redirect: {
                permanent: false, destination: '/login'
            }
        }
    }

    return {
        props: {
            owner: req.session.user.id
        }
    }
})