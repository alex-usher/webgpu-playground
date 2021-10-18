import { useEffect } from "react"
import "../assets/shaderCanvas.css"
import { checkWebGPU } from '../helper'
import { renderSimpleShader, shaderTriangleVertex } from "../render"
import Typography from "@mui/material/Typography"

interface ShaderCanvasInput {
    editorCode?: string
}

const ShaderCanvas = ({editorCode}: ShaderCanvasInput) => {
    useEffect(() => {
        console.log("rendering")
        renderSimpleShader(editorCode || shaderTriangleVertex)
    }, [editorCode])

    return (
        <div style={{color: "white", height: "90%"}}>
            {checkWebGPU()
                ? <div className="canvas-container">
                    <canvas id="canvas-webgpu" width="968" height="720"/>
                </div>
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
