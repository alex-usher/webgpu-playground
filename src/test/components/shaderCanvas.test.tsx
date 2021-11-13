import { render } from "@testing-library/react";
import ShaderCanvas from "../../components/ShaderCanvas";
import {
  shaderTriangleFragment,
  shaderTriangleVertex,
} from "../sample_shaders/triangle";

import * as shaders from "../../render";

const renderShaderCanvas = (setMessages: (messages: string) => void) =>
  render(
    <ShaderCanvas
      shaderCode={`${shaderTriangleVertex}\n${shaderTriangleFragment}`}
      setMessages={setMessages}
    />
  );

let checkWebGPUMock: jest.SpyInstance;
let simpleShaderMock: jest.SpyInstance;

const setMessages = jest.fn(() => {
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

    renderShaderCanvas(setMessages);

    expect(document.getElementById("canvas-webgpu")).toBeNull();
  });

  it("Should render the canvas when WebGPU is enabled", async () => {
    checkWebGPUMock.mockReturnValue(true);

    renderShaderCanvas(setMessages);

    expect(document.getElementById("canvas-webgpu")).not.toBeNull();
  });

  it("Should make calls to renderShader to render onto the canvas", () => {
    checkWebGPUMock.mockReturnValue(true);

    renderShaderCanvas(setMessages);

    expect(simpleShaderMock).toHaveBeenCalledTimes(1);
  });
});
