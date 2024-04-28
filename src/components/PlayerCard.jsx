import {Avatar} from "primereact/avatar"

export default function PlayerCard(props) {
    return (
        <>
            <Avatar image={props.user.profilePicture} size={props.isMobile ? "large" : "xlarge"} shape="circle"/>
            <div className="playercard_username-wrapper">
                <span className="playercard_username">
                    {props.user.username}
                    {props.icon && <i className={`pi ${props.icon}`}></i>}
                </span>
                {props.complementaryData && <span className="playercard_complementary">{props.complementaryData}</span>}
            </div>
        </>
    )
}