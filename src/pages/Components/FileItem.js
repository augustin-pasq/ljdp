import {Tag} from "primereact/tag";
import {Button} from "primereact/button";
import React from "react";

export default function FileItem(file, props) {
    return (
        <div className="flex align-items-center flex-wrap">
            <div className="flex align-items-center" style={{width: '40%'}}>
                <img alt={file.name} role="presentation" src={file.objectURL} width={100}/>
                <span className="flex flex-column text-left ml-3">
                        {file.name}
                    <small>{new Date().toLocaleDateString()}</small>
                    </span>
            </div>
            <Tag value={props.formatSize} severity="warning" className="px-3 py-2"/>
            <Button type="button" icon="pi pi-times"
                    className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                    onClick={() => onTemplateRemove(file, props.onRemove)}/>
        </div>
    );
};