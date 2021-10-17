import React from 'react'
import ReactDOM from 'react-dom'
// import {checkWebGPU} from './helper'
import {renderTriangle} from "./render"

import "./assets/style.css"
import CodeEditorPage from "./pages/CodeEditorPage";

// const message = checkWebGPU() ? "hello, triangle!" : "webgpu not supported!"

ReactDOM.render(
    <React.StrictMode>
        <CodeEditorPage/>
    </React.StrictMode>,
    document.getElementById('root')
);

renderTriangle().then(() => {})