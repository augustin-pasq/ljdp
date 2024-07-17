export default function Photo(props) {
    return (
        <div className="photo-component">
            {{
                "image":
                    <img src={`/${props.photo.link}`} alt="Photo"/>,

                "video":
                    <video controls>
                        <source src={`/${props.photo.link}`} type="video/mp4" />
                    </video>,

                "youtube":
                    <iframe src={props.photo.link} referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>

            }[props.photo.type]}
        </div>
    )
}