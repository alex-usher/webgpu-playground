import { useEffect } from "react"
import "../assets/shaderCanvas.css"
import { checkWebGPU } from '../helper'
import { renderSimpleShader } from "../render"
import Typography from "@mui/material/Typography";

interface ShaderCanvasInput {
    vertexCode: string
    fragmentCode: string
}

const ShaderCanvas = ({ vertexCode, fragmentCode }: ShaderCanvasInput) => {
    useEffect(() => {
        renderSimpleShader(vertexCode, fragmentCode)
    }, [vertexCode, fragmentCode])

    return (
        <div style={{ color: "white", height: "90%" }}>
            {checkWebGPU()
                ? <div className="canvas-container">
                    <canvas id="canvas-webgpu" width="3000" height="2160" />
                </div>
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
