import { useEffect } from "react"
import "../assets/shaderCanvas.css"
import { checkWebGPU } from '../helper'
import { renderSimpleShader } from "../render"
import Typography from "@mui/material/Typography";

const WIDTH_ASPECT = 968
const HEIGHT_ASPECT = 720

interface ShaderCanvasInput {
    vertexCode: string
    fragmentCode: string
}

const ShaderCanvas = ({ vertexCode, fragmentCode }: ShaderCanvasInput) => {
    useEffect(() => {
        renderSimpleShader(vertexCode, fragmentCode)
    }, [vertexCode, fragmentCode])

    const aspectMultiple = Math.min(window.innerWidth / WIDTH_ASPECT, window.innerHeight / HEIGHT_ASPECT)

    return (
        <div style={{ color: "white", height: "90%" }}>
            {checkWebGPU()
                ? <div className="canvas-container">
                    <canvas id="canvas-webgpu" width={aspectMultiple * WIDTH_ASPECT} height={aspectMultiple * HEIGHT_ASPECT} />
                </div>
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
