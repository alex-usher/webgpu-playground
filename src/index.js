import React from 'react';
import ReactDOM from 'react-dom';
import ShaderCanvas from './components/ShaderCanvas';
import {checkWebGPU} from './helper';
import {renderTriangle} from "./render";

const message = checkWebGPU() ? "hello, triangle!" : "webgpu not supported!";

ReactDOM.render(
    <React.StrictMode>
        <h1>{message}</h1>
        <ShaderCanvas />
    </React.StrictMode>,
    document.getElementById('root')
);

renderTriangle().then(() => {});