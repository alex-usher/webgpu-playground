import { useEffect, useState } from "react";
import "../assets/shaderCanvas.css";
import { checkWebGPU } from "../helper";
import { renderShader, updateCoordinates } from "../render";
import Typography from "@mui/material/Typography";

const WIDTH_ASPECT = 968;
const HEIGHT_ASPECT = 720;
const ASPECT_RATIO = 0.9;

interface ShaderCanvasInput {
  vertexCode: string;
  fragmentCode: string;
}

const ShaderCanvas = ({ vertexCode, fragmentCode }: ShaderCanvasInput) => {

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const aspectMultiple = Math.min(
    window.innerWidth / WIDTH_ASPECT,
    window.innerHeight / HEIGHT_ASPECT
  );

  useEffect(() => {
    renderShader(vertexCode, fragmentCode);
  }, [vertexCode, fragmentCode]);

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) => {
      const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
      let offsetLeft = canvas.getBoundingClientRect().left;
      let offsetTop = canvas.getBoundingClientRect().top;
      let xCoord = (e.pageX - offsetLeft) / (ASPECT_RATIO * aspectMultiple * WIDTH_ASPECT) * 2 - 1;
      let yCoord = -((e.pageY - offsetTop) / (ASPECT_RATIO * aspectMultiple * HEIGHT_ASPECT) * 2 - 1);
      setPosition({ x: xCoord, y: yCoord});
      updateCoordinates(position);
    };
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, [position, aspectMultiple]);



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
