import React, {useEffect, useRef, useState} from "react";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {useFormik} from "formik";
import {classNames} from "primereact/utils";
import CategoryItem from "@/pages/Components/CategoryItem";
import {Divider} from "primereact/divider";
import {Toast} from "primereact/toast";
import {ToggleButton} from "primereact/togglebutton";

export default function GameEditor(props) {
    const [categories, setCategories] = useState([])
    const [checked, setChecked] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        props.categories.forEach((category, index) => props.categories[index] =
            <CategoryItem key={index} id={category.id} title={category.title} type={category.type}/>)
        setCategories(props.categories);
    }, [props.categories]);

    const formik = useFormik({
        initialValues: {
            title: '',
            type: ''
        },
        validate: (data) => {
            let errors = {};

            if (!data.title || /^\s*$/.test(data.title)) errors.title = 'Requis.';
            if (!data.type || /^\s*$/.test(data.type)) errors.type = 'Requis.';

            return errors;
        },
        onSubmit: async (data) => {
            const body = {
                title: data.title,
                type: data.type,
                accessCode: props.accessCode
            }
            const results = await (await fetch('/api/category/createCategory', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })).json()

            if (results.success) setCategories(categories.concat(<CategoryItem id={results.content.id}
                                                                               title={results.content.title}
                                                                               type={results.content.type}/>))

            formik.resetForm();
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    const handleGameStatus = async (button) => {
        const results = await (await fetch('/api/game/setStatus', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accessCode: props.accessCode, status: button ? "Créée" : "Commencée"}),
        })).json()

        if (results.success) setChecked(button)
    }

    return (
        <>
            <Card className="px-3">
                <h1 className="text-6xl text-center p-8">Nouvelle partie</h1>

                <div className="grid flex md:flex-row flex-column">
                    <div className="col-7 pr-6">
                        <h2 className="text-3xl text-center pb-3">Catégories</h2>
                        <div className="flex flex-column gap-3 p-3" id="categories-container">
                            {categories}

                            <form onSubmit={formik.handleSubmit}
                                  className="grid flex category-item pl-3 pr-2 py-2 shadow-3 border-round-lg align-items-center">
                                <div className="col-7">
                                    <InputText id="title"
                                               name="title"
                                               placeholder="Titre"
                                               value={formik.values.title}
                                               onChange={formik.handleChange}
                                               className={`w-22rem ${classNames({'p-invalid': isFormFieldInvalid('type')})}`}
                                    />
                                </div>
                                <div className="col-4">
                                    <Dropdown inputId="type" name="type" value={formik.values.type}
                                              placeholder="Type"
                                              onChange={(e) => {
                                                  formik.setFieldValue("type", e.value);
                                              }} options={["Photo", "Vidéo", "YouTube"]}
                                              className={`w-10rem ${classNames({'p-invalid': isFormFieldInvalid('type')})}`}/>
                                </div>
                                <Button type="submit" icon="pi pi-plus"/>
                            </form>
                        </div>
                    </div>

                    <div className="col-5 pr-3 pl-6 flex flex-column align-items-center">
                        <h2 className="text-3xl text-center pb-3">Jouer avec des amis</h2>

                        {checked &&
                            <div className="flex flex-column justify-content-center text-lg text-center pb-6">
                                <p>Demande à tes amis d'aller sur <span
                                    className="text-xl text-primary">ljdp.augustinpasquier.com/upload</span> et de
                                    saisir ce code :</p>
                                <div className="flex flex-row align-items-center justify-content-center">
                                    <span className="game-access">{props.accessCode}</span>
                                    <Button icon="pi pi-copy" rounded text onClick={() => {
                                        navigator.clipboard.writeText(`${props.accessCode}`).then(toast.current.show({
                                            severity: 'success',
                                            summary: 'Le code a été copié',
                                            detail: 'Partage-le avec tes amis !',
                                            life: 3000
                                        }))
                                    }}/>
                                </div>
                                <Divider layout="horizontal" align="center">
                                    <b>OU</b>
                                </Divider>
                                <p>Envoie-leur ce lien :</p>
                                <div className="flex flex-row align-items-center justify-content-center">
                                    <span
                                        className="game-access">ljdp.augustinpasquier.com/upload/{props.accessCode}</span>
                                    <Button icon="pi pi-copy" rounded text onClick={() => {
                                        navigator.clipboard.writeText(`ljdp.augustinpasquier.com/join/${props.accessCode}`).then(toast.current.show({
                                            severity: 'success',
                                            summary: 'Le lien a été copié',
                                            detail: 'Partage-le avec tes amis !',
                                            life: 3000
                                        }))
                                    }}/>
                                </div>
                            </div>
                        }

                        {!checked &&
                            <div className="flex flex-column justify-content-center text-lg text-center pb-6">
                                <p>Demande à tes amis d'aller sur <span
                                    className="text-xl text-primary">ljdp.augustinpasquier.com/join</span> et de saisir
                                    ce code :</p>
                                <div className="flex flex-row align-items-center justify-content-center">
                                    <span className="game-access">{props.accessCode}</span>
                                    <Button icon="pi pi-copy" rounded text onClick={() => {
                                        navigator.clipboard.writeText(`${props.accessCode}`).then(toast.current.show({
                                            severity: 'success',
                                            summary: 'Le code a été copié',
                                            detail: 'Partage-le avec tes amis !',
                                            life: 3000
                                        }))
                                    }}/>
                                </div>
                                <Divider layout="horizontal" align="center">
                                    <b>OU</b>
                                </Divider>
                                <p>Envoie-leur ce lien :</p>
                                <div className="flex flex-row align-items-center justify-content-center">
                                    <span
                                        className="game-access">ljdp.augustinpasquier.com/join/{props.accessCode}</span>
                                    <Button icon="pi pi-copy" rounded text onClick={() => {
                                        navigator.clipboard.writeText(`ljdp.augustinpasquier.com/join/${props.accessCode}`).then(toast.current.show({
                                            severity: 'success',
                                            summary: 'Le lien a été copié',
                                            detail: 'Partage-le avec tes amis !',
                                            life: 3000
                                        }))
                                    }}/>
                                </div>
                            </div>
                        }

                        <ToggleButton onLabel="Démarrer la partie"
                                      offLabel="Arrêter la partie"
                                      checked={checked}
                                      onChange={(e) => handleGameStatus(e.value)}/>

                        {checked &&
                            <small className="pt-3 text-700">(Toi et tes amis ne pourrez plus uploader de fichiers une fois la partie commencée.)</small>
                        }

                        {!checked &&
                            <small className="pt-3 text-700">(La partie reprendra depuis le début et les scores seront réinitialisés.)</small>
                        }
                    </div>
                </div>
            </Card>
            <Toast ref={toast} position="bottom-left"/>
        </>
    )
}