import {Button} from "primereact/button";
import React from "react";

export default function CategoryItem(props) {
    const handleDelete = async (id) => {
        await (await fetch('/api/category/deleteCategory', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id}),
        })).json()

        document.getElementById(id).remove()
    };

    return (
        <div id={props.id} className="grid flex category-item pl-4 pr-2 py-2 shadow-3 border-round-lg align-items-center">
            <span className="col-7">{props.title}</span>
            <span className="col-4">{props.type}</span>
            <Button icon="pi pi-trash" onClick={() => handleDelete(props.id)}/>
        </div>
    )
}