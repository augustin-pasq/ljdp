import React from 'react';
import {Card} from "primereact/card";
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {withSessionSsr} from "../../../lib/ironSession";
import {useFormik} from "formik";
import {useRouter} from "next/router";
import {classNames} from "primereact/utils";

export default function CreateGame() {
    const router = useRouter()
    if (router.query.accessCode === undefined) router.push('/home')

    const [selectedType, setSelectedType] = React.useState('')
    const [errorMessage, setErrorMessage] = React.useState('')
    const [category, setCategory] = React.useState('')


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
            const body = {title: data.title, type: data.type, accessCode: router.query.accessCode}
            const results = await (await fetch('/api/category/createCategory', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })).json()

            if (results.success) setCategory(results.content)
            else setErrorMessage('undefinedError')

            formik.resetForm();
        }
    })

    const isFormFieldInvalid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldInvalid(name) ? <small className="p-error">{formik.errors[name]}</small> : '';
    }

    return (
        <Card>
            <h1>Nouvelle partie</h1>
            <h2>Catégories</h2>
            <form onSubmit={formik.handleSubmit}>
                <span className="p-float-label">
                    <InputText id="title"
                               name="title"
                               value={formik.values.title}
                               onChange={(e) => {
                                   formik.setFieldValue("title", e.target.value)
                               }}
                               className={classNames({'p-invalid': isFormFieldInvalid('title')})}
                    />
                    <label htmlFor="title">Titre<span> *</span></label>
                </span>
                {getFormErrorMessage('title')}
                <span className="p-float-label">
                    <Dropdown inputId="type" name="type" value={formik.values.type} onChange={(e) => {
                        formik.setFieldValue("type", e.value);
                    }} options={["Photo", "Vidéo", "Audio", "Document", "Web"]}/>
                    <label htmlFor="type">Type<span> *</span></label>
                </span>
                {getFormErrorMessage('type')}
                <Button type="submit" icon="pi pi-plus"/>
            </form>
        </Card>
    )
}

export const getServerSideProps = withSessionSsr(
    async function getServerSideProps({req}) {
        let user = req.session.user;

        if (!user?.isLoggedIn) {
            return {
                redirect: {
                    permanent: false,
                    destination: '/login'
                }
            }
        }

        return {
            props: {}
        }
    }
)