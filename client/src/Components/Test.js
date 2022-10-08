// testing link to flask server
import React from 'react';


export const Test = ({data})=> {
    return(
        <div>
            <h1>{data.name}</h1>
            <h1>{data.test}</h1>
        </div>
    )
}