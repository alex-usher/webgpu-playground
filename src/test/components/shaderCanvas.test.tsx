import { render } from "@testing-library/react";
import ShaderCanvas from "../../components/ShaderCanvas";
import {
  shaderTriangleFragment,
  shaderTriangleVertex,
} from "../sample_shaders/triangle";

import * as shaders from "../../render";
import { RenderLogger } from "../../objects/RenderLogger";

const renderShaderCanvas = (
  setRenderLogger: (renderLogger: RenderLogger) => void
) =>
  render(
    <ShaderCanvas
      shaderCode={`${shaderTriangleVertex}\n${shaderTriangleFragment}`}
      setRenderLogger={setRenderLogger}
    />
  );

let checkWebGPUMock: jest.SpyInstance;
let simpleShaderMock: jest.SpyInstance;

const setRenderLogger = jest.fn(() => {
  undefined;
});

describe("Shader Canvas component tests", () => {
  beforeEach(() => {
    checkWebGPUMock = jest.spyOn(shaders, "checkWebGPU");
    simpleShaderMock = jest.spyOn(shaders, "renderShader");

    simpleShaderMock.mockImplementation(() => {
      return new Promise((resolve) => resolve(""));
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should not render the canvas when WebGPU is disabled", async () => {
    checkWebGPUMock.mockReturnValue(false);

    renderShaderCanvas(setRenderLogger);

    expect(document.getElementById("canvas-webgpu")).toBeNull();
  });

  it("Should render the canvas when WebGPU is enabled", async () => {
    checkWebGPUMock.mockReturnValue(true);

    renderShaderCanvas(setRenderLogger);

    expect(document.getElementById("canvas-webgpu")).not.toBeNull();
  });

  it("Should make calls to renderShader to render onto the canvas", () => {
    checkWebGPUMock.mockReturnValue(true);

    renderShaderCanvas(setRenderLogger);

    expect(simpleShaderMock).toHaveBeenCalledTimes(1);
  });
});
