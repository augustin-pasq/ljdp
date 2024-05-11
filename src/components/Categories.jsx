import {Button} from "primereact/button"
import {Skeleton} from "primereact/skeleton"

export default function Categories(props) {
    return(
        <ul>
            {props.categories !== null ?
                props.categories.map(category => {
                    return (
                        <li key={category.id} className={`category${props.clickable ? " hover" : ""}${category === props.selectedCategory ? " selected" : ""}`} onClick={() => props.clickable && props.handleAction(category)}>
                            <span className="title">{category.title}</span>
                            {(props.page === "upload" || props.buttonIcon) && <Button rounded icon={props.page !== "upload" ? props.buttonIcon : category.link === null ? "pi pi-cloud-upload" : "pi pi-check"} severity={props.page !== "upload" ? "" : category.link === null ? "" : "success"} onClick={() => props.handleAction(category)} />}
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