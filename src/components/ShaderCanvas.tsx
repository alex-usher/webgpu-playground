import "../assets/shaderCanvas.css";

import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { RenderLogger } from "../objects/RenderLogger";
import { MeshType } from "../objects/Shader";
import { checkWebGPU } from "../webgpu/pipelines/helpers";
import { renderShader, updateCoordinates } from "../webgpu/pipelines/render";

const WIDTH_ASPECT = 968;
const HEIGHT_ASPECT = 720;
const ASPECT_RATIO = 0.9;

interface ShaderCanvasInput {
  shaderCode: string;
  setRenderLogger: (renderLogger: RenderLogger) => void;
  meshType: MeshType;
  vertexBuffer: string;
  colourBuffer: string;
  numberOfVertices: string;
  numberOfParticles: string;
  imageUrl?: string;
  computeCode?: string;
}

const ShaderCanvas = ({
  shaderCode,
  setRenderLogger,
  meshType,
  vertexBuffer,
  colourBuffer,
  numberOfVertices,
  numberOfParticles,
  imageUrl,
  computeCode,
}: ShaderCanvasInput) => {
  const renderLogger = new RenderLogger();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const aspectMultiple = Math.min(
    window.innerWidth / WIDTH_ASPECT,
    window.innerHeight / HEIGHT_ASPECT
  );

  const webGPUAvailable = checkWebGPU();

  useEffect(() => {
    if (shaderCode !== "" && shaderCode !== undefined && webGPUAvailable) {
      renderShader(
        shaderCode,
        meshType,
        renderLogger,
        vertexBuffer,
        colourBuffer,
        numberOfVertices,
        numberOfParticles,
        imageUrl,
        computeCode
      ).then(() => {
        setRenderLogger(renderLogger);
      });
    }
  }, [
    shaderCode,
    vertexBuffer,
    colourBuffer,
    numberOfVertices,
    numberOfParticles,
    imageUrl,
    computeCode,
  ]);

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) => {
      const canvas = document.getElementById(
        "canvas-webgpu"
      ) as HTMLCanvasElement;
      const offsetLeft =
        canvas != null ? canvas.getBoundingClientRect().left : 0.0;
      const offsetTop =
        canvas != null ? canvas.getBoundingClientRect().top : 0.0;
      const xCoord = (e.pageX - offsetLeft) / ASPECT_RATIO;
      const yCoord = (e.pageY - offsetTop) / ASPECT_RATIO;
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
      {webGPUAvailable ? (
        <div className="canvas-container">
          <canvas
            id="canvas-webgpu"
            width={aspectMultiple * WIDTH_ASPECT}
            height={aspectMultiple * HEIGHT_ASPECT}
          />
        </div>
      ) : (
        <Typography
          variant="h2"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translateY(-50%) translateX(-50%)",
            display: "inline-block",
          }}
        >
          {`WebGPU support not enabled!\n
          Are you using Chrome Canary?`}
        </Typography>
      )}
    </div>
  );
};

export default ShaderCanvas;
