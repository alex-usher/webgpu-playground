import React from 'react';
import ReactDOM from 'react-dom';
import {checkWebGPU} from './helper';
import {renderTriangle} from "./render";

const message = checkWebGPU() ? "hello, triangle!" : "webgpu not supported!";

ReactDOM.render(
    <React.StrictMode>
        <h1>{message}</h1>
        <canvas id="canvas-webgpu" width="968" height="720"/>
    </React.StrictMode>,
    document.getElementById('root')
);

renderTriangle().then(() => {});