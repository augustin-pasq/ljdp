import {Button} from "primereact/button"
import {Skeleton} from "primereact/skeleton"

export default function Categories(props) {
    return(
        <ul>
            {props.categories !== null ?
                props.categories.map(category => {
                    return (
                        <li key={category.id} className={`category${props.clickable ? " hover" : ""}${category === props.selectedCategory ? " selected" : ""}`} onClick={() => props.clickable && props.handleAction(category.id)}>
                            <span className="title">{category.title}</span>
                            <Button rounded icon={props.buttonIcon} severity={props.buttonSeverity} onClick={() => props.handleAction(category.id)} />
                        </li>
                    )})
                :
                <>
                    <Skeleton height="4.5rem" borderRadius="100rem"/>
                    <Skeleton height="4.5rem" borderRadius="100rem"/>
                    <Skeleton height="4.5rem" borderRadius="100rem"/>
                </>
            }
        </ul>
    )
}

/*
{{
    "/edit": <Button icon="pi pi-trash" rounded onClick={() => props.handleAction(category.id)}/>,
    "/upload": <Button icon={`pi ${category.link === null ? "pi-cloud-upload" : "pi-check"}`} rounded severity={category.link === null ? "" : "success"} onClick={() => selectCategory(category, props.page)}/>,
    "/scores": <Button icon="pi pi-arrow-right" rounded onClick={() => selectCategory(category, props.page)}/>,
}[props.page]}
 */