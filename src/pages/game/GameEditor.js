import React, {useEffect, useState} from "react";
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {useFormik} from "formik";
import {classNames} from "primereact/utils";
import CategoryItem from "@/pages/game/CategoryItem";

export default function GameEditor(props) {

    const [categories, setCategories] = useState([])

    useEffect(() => {
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

            if (results.success) setCategories(categories.concat(<CategoryItem id={results.content.id} title={results.content.title} type={results.content.type}/>))

            formik.resetForm();
        }
    })

    const isFormFieldInvalid = (value) => !!(formik.touched[value] && formik.errors[value])

    return (
        <Card>
            <h1 className="text-6xl text-center pb-5">Nouvelle partie</h1>

            <div className="grid flex md:flex-row flex-column">
                <div className="col-7">
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
                                           onChange={(e) => {
                                               formik.setFieldValue("title", e.target.value)
                                           }}
                                           className={`w-22rem ${classNames({'p-invalid': isFormFieldInvalid('type')})}`}
                                />
                            </div>
                            <div className="col-4">
                                <Dropdown inputId="type" name="type" value={formik.values.type}
                                          placeholder="Type"
                                          onChange={(e) => {
                                              formik.setFieldValue("type", e.value);
                                          }} options={["Photo", "Vidéo", "Audio", "Document", "Web"]}
                                          className={`w-10rem ${classNames({'p-invalid': isFormFieldInvalid('type')})}`}/>
                            </div>
                            <Button type="submit" icon="pi pi-plus"/>
                        </form>
                    </div>
                </div>

                <div className="col-5">
                    <h2 className="text-3xl text-center pb-3">Jouer avec des amis</h2>
                </div>
            </div>
        </Card>
    )
}