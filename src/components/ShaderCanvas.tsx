import { useEffect, useState } from "react";
import "../assets/shaderCanvas.css";
import { checkWebGPU } from "../render";
import { renderShader, updateCoordinates } from "../render";
import Typography from "@mui/material/Typography";

const WIDTH_ASPECT = 968;
const HEIGHT_ASPECT = 720;
const ASPECT_RATIO = 0.9;

interface ShaderCanvasInput {
  vertexCode: string;
  fragmentCode: string;
  imagePath: string;
}

const ShaderCanvas = ({
  vertexCode,
  fragmentCode,
  imagePath,
}: ShaderCanvasInput) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const aspectMultiple = Math.min(
    window.innerWidth / WIDTH_ASPECT,
    window.innerHeight / HEIGHT_ASPECT
  );

  useEffect(() => {
    renderShader(vertexCode, fragmentCode, imagePath);
  }, [vertexCode, fragmentCode, imagePath]);

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) => {
      const canvas = document.getElementById(
        "canvas-webgpu"
      ) as HTMLCanvasElement;
      const offsetLeft = canvas.getBoundingClientRect().left;
      const offsetTop = canvas.getBoundingClientRect().top;
      const xCoord =
        ((e.pageX - offsetLeft) /
          (ASPECT_RATIO * aspectMultiple * WIDTH_ASPECT)) *
          2 -
        1;
      const yCoord = -(
        ((e.pageY - offsetTop) /
          (ASPECT_RATIO * aspectMultiple * HEIGHT_ASPECT)) *
          2 -
        1
      );
      setPosition({ x: xCoord, y: yCoord });
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
