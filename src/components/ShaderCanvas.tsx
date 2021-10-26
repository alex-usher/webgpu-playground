import { useEffect, useState } from "react";
import "../assets/shaderCanvas.css";
import { checkWebGPU } from "../helper";
import { renderShader, updateCoordinates } from "../render";
import Typography from "@mui/material/Typography";

const WIDTH_ASPECT = 968;
const HEIGHT_ASPECT = 720;

interface ShaderCanvasInput {
  vertexCode: string;
  fragmentCode: string;
}

const ShaderCanvas = ({ vertexCode, fragmentCode }: ShaderCanvasInput) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    renderShader(vertexCode, fragmentCode);
  }, [vertexCode, fragmentCode]);

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      updateCoordinates(position);
    };
    window.addEventListener("mousemove", setFromEvent);
  }, []);

  const aspectMultiple = Math.min(
    window.innerWidth / WIDTH_ASPECT,
    window.innerHeight / HEIGHT_ASPECT
  );

  return (
    <div style={{ color: "white", height: "90%" }}>
      {checkWebGPU() ? (
        <div className="canvas-container">
          <canvas
            id="canvas-webgpu"
            width={aspectMultiple * WIDTH_ASPECT}
            height={aspectMultiple * HEIGHT_ASPECT}
          />
        </div>
      ) : (
        <Typography variant="h2"> webgpu not supported!</Typography>
      )}
    </div>
  );
};

export default ShaderCanvas;
