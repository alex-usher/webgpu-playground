import { useEffect } from "react";
import "../assets/shaderCanvas.css";
import { checkWebGPU } from '../helper'
import { renderTriangle } from "../render"
import Typography from "@mui/material/Typography";


const ShaderCanvas = () => {
    useEffect(() => {
        renderTriangle().then(() => {})
    })

    return (
        <div style={{height: "90%"}}>
            {checkWebGPU()
                ? <div className="canvas-container">
                    <canvas id="canvas-webgpu" width="968" height="720"/>
                </div>
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
