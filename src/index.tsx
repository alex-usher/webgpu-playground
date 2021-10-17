import React from 'react'
import ReactDOM from 'react-dom'
import ShaderCanvas from './components/ShaderCanvas'
// import {checkWebGPU} from './helper'
import {renderTriangle} from "./render"

import "./assets/style.css"

// const message = checkWebGPU() ? "hello, triangle!" : "webgpu not supported!"

ReactDOM.render(
    <React.StrictMode>
        <div id="body">
            <ShaderCanvas />
        </div>
    </React.StrictMode>,
    document.getElementById('root')
);

renderTriangle().then(() => {})