import React from "react"

export default function Card(props) {
    return (

        <div className="card1">
            <img src={require(`../images/${props.img}`)} alt={props.title} className="card--image"/>
            <div className="card--text">
                {props.title}
            </div>
        </div>

    )
}


