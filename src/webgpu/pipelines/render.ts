import assert from "assert";

import { mat4 } from "gl-matrix";

import { RenderLogger } from "../../objects/RenderLogger";
import { MeshType } from "../../objects/Shader";
import { getImageFromUrl } from "../../utils/imageHelper";
import { cubeColours, cubePositions } from "../meshes/cube";
import { rectangleMesh } from "../meshes/rectangle";
import { texturedRectangleMesh } from "../meshes/texturedRectangle";
import { structs } from "../shaders";
import {
  addUniformCode,
  addViewParamsToBuffer,
  checkWebGPU,
  createGPUBuffer,
  createTransforms,
  createViewProjection,
  outputMessages,
} from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createCamera = require("3d-view-controls");
const SWAPCHAIN_FORMAT = "bgra8unorm";
const DEPTH_FORMAT = "depth24plus-stencil8";

let time = 0;
let x = 0;
let y = 0;
let canvasVisible = false;

let renderFrame = -1;

export const updateCoordinates = (position: { x: number; y: number }): void => {
  x = position.x;
  y = position.y;
};

const initialiseGPU = async (
  code: string,
  usage: number,
  renderLogger: RenderLogger
) => {
  if (!checkWebGPU()) {
    return undefined;
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;
  assert(navigator.gpu);
  const adapter = await navigator.gpu.requestAdapter();
  assert(adapter);
  const device = await adapter.requestDevice();

  // add in uniform constant code in fragment shader
  code = addUniformCode(code);

  const shaderModule = device.createShaderModule({
    code: `${structs}\n${code}`,
  });

  // check for compilation failures and output any compile messages
  if (!(await outputMessages(shaderModule, renderLogger))) {
    renderLogger.logMessage("Shader Compilation failed", "error");
    return undefined;
  }

  renderLogger.logMessage("Shader Compilation successful", "success");

  // cancel the previous render once we know the next render will compile
  if (renderFrame != -1) {
    cancelAnimationFrame(renderFrame);
  }

  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;

  context.configure({
    device: device,
    format: SWAPCHAIN_FORMAT,
    usage: usage,
  });

  return { canvas, context, device, shaderModule };
};

export const generateFrameFunction = (
  canvas: HTMLCanvasElement,
  context: GPUCanvasContext,
  bindGroup: GPUBindGroup,
  vertexCount: number,
  vertexBuffer: GPUBuffer,
  colourBuffer: GPUBuffer | null,
  device: GPUDevice,
  renderPipeline: GPURenderPipeline,
  viewParamsBuffer: GPUBuffer,
  samplingTexture?: GPUTexture
): (() => void) => {
  const frame = (): void => {
    const res_x = canvas.width;
    const res_y = canvas.height;
    if (canvasVisible) {
      const commandEncoder = device.createCommandEncoder();
      addViewParamsToBuffer(
        device,
        commandEncoder,
        viewParamsBuffer,
        time,
        x,
        y,
        res_x,
        res_y
      );

      const currentTexture = context.getCurrentTexture();

      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
            view: currentTexture.createView(),
          },
        ],
      });

      renderPass.setPipeline(renderPipeline);
      renderPass.setVertexBuffer(0, vertexBuffer);
      if (colourBuffer) {
        renderPass.setVertexBuffer(1, colourBuffer);
      }
      renderPass.setBindGroup(0, bindGroup);
      renderPass.draw(vertexCount);
      renderPass.endPass();

      if (samplingTexture) {
        commandEncoder.copyTextureToTexture(
          {
            texture: currentTexture,
          },
          {
            texture: samplingTexture,
          },
          [canvas.width, canvas.height]
        );
      }

      device.queue.submit([commandEncoder.finish()]);
      time++;
    }

    renderFrame = requestAnimationFrame(frame);
  };

  return frame;
};

export const renderRectangleShader = async (
  shaderCode: string,
  renderLogger: RenderLogger,
  imageUrl?: string,
  isTextured = false
): Promise<void> => {
  const init = await initialiseGPU(
    shaderCode,
    GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC,
    renderLogger
  );

  if (init === undefined) return;

  // delay pattern match so we can test for error
  const { canvas, context, device, shaderModule } = init;

  // allocate a buffer using the rectangle mesh
  const dataBuffer = createGPUBuffer(
    device,
    isTextured ? texturedRectangleMesh : rectangleMesh
  );

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: [{ type: "uniform" }],
      } as GPUBindGroupLayoutEntry,
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        type: "sampler",
        sampler: {
          type: "filtering",
        },
      } as GPUBindGroupLayoutEntry,
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        type: "sampled-texture",
        texture: {
          sampleType: "float",
          viewDimension: "2d",
          multisampled: false,
        },
      } as GPUBindGroupLayoutEntry,
      ...(isTextured
        ? [
            {
              binding: 3,
              visibility: GPUShaderStage.FRAGMENT,
              type: "sampler",
              sampler: {
                type: "filtering",
              },
            } as GPUBindGroupLayoutEntry,
            {
              binding: 4,
              visibility: GPUShaderStage.FRAGMENT,
              type: "sampled-texture",
              texture: {
                sampleType: "float",
                viewDimension: "2d",
                multisampled: false,
              },
            } as GPUBindGroupLayoutEntry,
          ]
        : []),
    ],
  });

  const layout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: layout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertex_main",
      buffers: [
        {
          arrayStride: 6 * 4,
          stepMode: "vertex",
          attributes: [
            { format: "float32x2", offset: 0, shaderLocation: 0 },
            { format: "float32x4", offset: 2 * 4, shaderLocation: 1 },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [{ format: SWAPCHAIN_FORMAT }],
    },
  });

  const viewParamsBuffer = device.createBuffer({
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const samplingTexture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depth: 1,
    } as GPUExtent3DDict,
    format: SWAPCHAIN_FORMAT,
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  const samplingSampler = device.createSampler({
    magFilter: "linear",
    minFilter: "nearest",
  });

  let bindGroup: GPUBindGroup;

  if (isTextured) {
    const img = await getImageFromUrl(
      imageUrl || "https://i.ibb.co/M5Z06wy/triangle.png"
    );
    const bitmap = await createImageBitmap(img);

    const extent3dDict = {
      width: img.width,
      height: img.height,
      depth: 1,
    } as GPUExtent3DDict;

    const textureSampler = device.createSampler({
      magFilter: "linear",
      minFilter: "nearest",
    });

    const texture2d = device.createTexture({
      size: extent3dDict,
      dimension: "2d",
      format: SWAPCHAIN_FORMAT,
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });

    device.queue.copyExternalImageToTexture(
      {
        source: bitmap,
      },
      {
        texture: texture2d,
        mipLevel: 0,
      },
      extent3dDict
    );

    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: viewParamsBuffer } },
        { binding: 1, resource: samplingSampler },
        { binding: 2, resource: samplingTexture.createView() },
        { binding: 3, resource: textureSampler },
        { binding: 4, resource: texture2d.createView() },
      ],
    });
  } else {
    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: viewParamsBuffer } },
        { binding: 1, resource: samplingSampler },
        { binding: 2, resource: samplingTexture.createView() },
      ],
    });
  }

  // track when canvas is visible and only render when true
  canvasVisible = false;
  const observer = new IntersectionObserver(
    (e) => {
      canvasVisible = e[0].isIntersecting;
    },
    { threshold: [0] }
  );
  observer.observe(canvas);

  time = 0;
  const frame = generateFrameFunction(
    canvas,
    context,
    bindGroup,
    6,
    dataBuffer,
    null,
    device,
    renderPipeline,
    viewParamsBuffer,
    samplingTexture
  );

  renderFrame = requestAnimationFrame(frame);
};

export const renderCubeShader = async (
  shaderCode: string,
  renderLogger: RenderLogger
): Promise<void> => {
  const init = await initialiseGPU(
    shaderCode,
    GPUTextureUsage.RENDER_ATTACHMENT,
    renderLogger
  );

  if (init === undefined) return;

  // delay pattern match so we can test for error
  const { canvas, context, device, shaderModule } = init;

  // --------------------------------------------------------------------------------------
  // create buffers
  const numberOfVertices = cubePositions.length / 3;
  const vertexBuffer = createGPUBuffer(device, cubePositions);
  const colorBuffer = createGPUBuffer(device, cubeColours);

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: DEPTH_FORMAT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: [{ type: "uniform" }],
      } as GPUBindGroupLayoutEntry,
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: [{ type: "uniform" }],
      } as GPUBindGroupLayoutEntry,
    ],
  });

  const layout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: layout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertex_main",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [{ format: SWAPCHAIN_FORMAT }],
    },
    depthStencil: {
      format: DEPTH_FORMAT,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const viewParamsBuffer = device.createBuffer({
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: viewParamsBuffer } },
    ],
  });

  // create uniform data
  const modelMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  let vpMatrix = mat4.create();
  const vp = createViewProjection(canvas.width / canvas.height);
  vpMatrix = vp.viewProjectionMatrix;
  let vMatrix = mat4.create();
  const body = document.getElementById("body") as HTMLCanvasElement;
  const camera = createCamera(body, vp.cameraOption);

  // track when canvas is visible and only render when true
  let canvasVisible = false;
  const observer = new IntersectionObserver(
    (e) => {
      canvasVisible = e[0].isIntersecting;
    },
    { threshold: [0] }
  );
  observer.observe(canvas);

  let time = 0;
  const res_x = canvas.width;
  const res_y = canvas.height;
  const frame = () => {
    if (canvasVisible) {
      const commandEncoder = device.createCommandEncoder();

      addViewParamsToBuffer(
        device,
        commandEncoder,
        viewParamsBuffer,
        time,
        x,
        y,
        res_x,
        res_y
      );

      const renderPassDescription = {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadValue: [0.0, 0.0, 0.0, 1.0],
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthLoadValue: 1.0,
          depthStoreOp: "store",
          stencilLoadValue: 0,
          stencilStoreOp: "store",
        },
      };

      if (camera.tick()) {
        const pMatrix = vp.projectionMatrix;
        vMatrix = camera.matrix;
        mat4.multiply(vpMatrix, pMatrix, vMatrix);
      }

      createTransforms(modelMatrix);
      mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
      device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);

      const renderPass = commandEncoder.beginRenderPass(
        renderPassDescription as GPURenderPassDescriptor
      );
      renderPass.setPipeline(renderPipeline);
      renderPass.setBindGroup(0, uniformBindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setVertexBuffer(1, colorBuffer);
      renderPass.draw(numberOfVertices);
      renderPass.endPass();

      device.queue.submit([commandEncoder.finish()]);
      time++;
    }

    renderFrame = requestAnimationFrame(frame);
  };

  renderFrame = requestAnimationFrame(frame);
};

export const renderCustomShader = async (
  shaderCode: string,
  renderLogger: RenderLogger,
  vertices: Float32Array,
  colours: Float32Array,
  vertexCount: number
): Promise<void> => {
  const init = await initialiseGPU(
    shaderCode,
    GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_SRC,
    renderLogger
  );

  if (init === undefined) return;

  // delay pattern match so we can test for error
  const { canvas, context, device, shaderModule } = init;

  // allocate a buffer using the rectangle mesh
  const vertexBuffer = createGPUBuffer(device, vertices);

  const colourBuffer = createGPUBuffer(device, colours);

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: [{ type: "uniform" }],
      } as GPUBindGroupLayoutEntry,
    ],
  });

  const layout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: layout,
    vertex: {
      module: shaderModule,
      entryPoint: "vertex_main",
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [{ format: "float32x2", offset: 0, shaderLocation: 0 }],
        },
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              format: "float32x4",
              offset: 0,
              shaderLocation: 1,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [{ format: SWAPCHAIN_FORMAT }],
    },
  });

  const viewParamsBuffer = device.createBuffer({
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: viewParamsBuffer } }],
  });

  // track when canvas is visible and only render when true
  canvasVisible = false;
  const observer = new IntersectionObserver(
    (e) => {
      canvasVisible = e[0].isIntersecting;
    },
    { threshold: [0] }
  );
  observer.observe(canvas);

  time = 0;
  const frame = generateFrameFunction(
    canvas,
    context,
    bindGroup,
    vertexCount,
    vertexBuffer,
    colourBuffer,
    device,
    renderPipeline,
    viewParamsBuffer
  );

  renderFrame = requestAnimationFrame(frame);
};

export const renderShader = async (
  shaderCode: string,
  meshType: MeshType,
  renderLogger: RenderLogger,
  vertices: string,
  colours: string,
  vertexCount: string,
  imageUrl?: string
): Promise<void> => {
  switch (meshType) {
    case MeshType.RECTANGLE:
      return renderRectangleShader(shaderCode, renderLogger);
    case MeshType.TEXTURED_RECTANGLE:
      return renderRectangleShader(shaderCode, renderLogger, imageUrl, true);
    case MeshType.CUBE:
      return renderCubeShader(shaderCode, renderLogger);
    case MeshType.CUSTOM:
      if (vertices && colours && vertexCount) {
        try {
          const vertexBuffer = new Float32Array(JSON.parse(vertices));
          const colourBuffer = new Float32Array(JSON.parse(colours));
          const numberOfVertices = parseInt(vertexCount);

          return renderCustomShader(
            shaderCode,
            renderLogger,
            vertexBuffer,
            colourBuffer,
            numberOfVertices
          );
        } catch (e) {
          return;
        }
      }
      break;
    default:
      return;
  }
};
