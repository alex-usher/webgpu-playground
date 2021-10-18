import { useEffect } from "react"
import "../assets/shaderCanvas.css"
import { checkWebGPU } from '../helper'
import { renderSimpleShader } from "../render"
import Typography from "@mui/material/Typography";
import { collection, addDoc } from "firebase/firestore"
import { firedb } from "../firebase";

const submitShader = () => {
    addDoc(collection(firedb, "public-shaders"), {
        shader_name: "unknown name",
        shader_code: "LINK TO CODE",
    });
}

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
                    <canvas id="canvas-webgpu" width="968" height="720" />
                </div>
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
