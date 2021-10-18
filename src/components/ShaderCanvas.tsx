import { useEffect } from "react";
import "../assets/shaderCanvas.css";
import { checkWebGPU } from '../helper'
import { renderTriangle } from "../render"
import Typography from "@mui/material/Typography";
import { collection, addDoc } from "firebase/firestore"
import { firedb } from "../firebase";

const submitShader = () => {
    addDoc(collection(firedb, "public-shaders"), {
        shader_name: "unknown name",
        shader_code: "LINK TO CODE",
      });
} 


const ShaderCanvas = () => {
    useEffect(() => {
        renderTriangle().then(() => {submitShader()})
    })
    
    return (
        <div style={{color: "white"}}>
            {checkWebGPU() 
                ? <div className="canvas-container">
                    <canvas id="canvas-webgpu" width="968" height="720"/>
                </div>  
                : <Typography variant="h2"> webgpu not supported!</Typography>}
        </div>
    )
}

export default ShaderCanvas;
