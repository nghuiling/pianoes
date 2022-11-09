import React from "react"
import pianoesLogo from "../images/logo_black.png"
import backButton from "../images/back_button.png"

import {BrowserRouter as Router, Link} from 'react-router-dom';

export default function Navbar() {
    return (
        <nav>
        <div>
        <Link to="/">
        <img src={pianoesLogo} alt="Pianoes" className="nav--logo"/></Link>
        </div>
        
        <div>
        <Link to="/">
        <img src={backButton} alt="Back" className="nav--logo"/>
        </Link>
        </div>
        </nav>



    )
}