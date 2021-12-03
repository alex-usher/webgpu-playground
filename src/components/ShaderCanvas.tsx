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
  imageUrl?: string;
}

const ShaderCanvas = ({
  shaderCode,
  setRenderLogger,
  meshType,
  vertexBuffer,
  colourBuffer,
  numberOfVertices,
  imageUrl,
}: ShaderCanvasInput) => {
  const renderLogger = new RenderLogger();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const aspectMultiple = Math.min(
    window.innerWidth / WIDTH_ASPECT,
    window.innerHeight / HEIGHT_ASPECT
  );

  useEffect(() => {
    if (shaderCode !== "" && shaderCode !== undefined) {
      renderShader(
        shaderCode,
        meshType,
        renderLogger,
        vertexBuffer,
        colourBuffer,
        numberOfVertices,
        imageUrl
      ).then(() => {
        setRenderLogger(renderLogger);
      });
    }
  }, [shaderCode, vertexBuffer, colourBuffer, numberOfVertices, imageUrl]);

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
      {checkWebGPU() ? (
        <div className="canvas-container">
          <canvas
            id="canvas-webgpu"
            width={aspectMultiple * WIDTH_ASPECT}
            height={aspectMultiple * HEIGHT_ASPECT}
          />
        </div>
      ) : (
        <Typography variant="h2">
          WebGPU support not enabled! Are you using Chrome Canary?
        </Typography>
      )}
    </div>
  );
};

export default ShaderCanvas;
