import assert from "assert";
import { structs } from "../shaders";
import {
  addViewParamsToBuffer,
  checkWebGPU,
  createGPUBuffer,
  createTransforms,
  createViewProjection,
  outputMessages,
} from "./helpers";
import { texturedRectangleMesh } from "../meshes/texturedRectangle";
import { cubeColours, cubePositions } from "../meshes/cube";
import { mat4 } from "gl-matrix";
import { RenderLogger } from "../../objects/RenderLogger";
import { MeshType } from "../../objects/Shader";
import { getImageFromUrl } from "../../utils/imageHelper";
import { rectangleMesh } from "../meshes/rectangle";

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
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;

  context.configure({
    device: device,
    format: SWAPCHAIN_FORMAT,
    usage: usage,
  });

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

  return { canvas, context, device, shaderModule };
};

export const generateFrameFunction = (
  canvas: HTMLCanvasElement,
  context: GPUCanvasContext,
  bindGroup: GPUBindGroup,
  dataBuffer: GPUBuffer,
  device: GPUDevice,
  renderPipeline: GPURenderPipeline,
  viewParamsBuffer: GPUBuffer
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

      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: "store",
            view: context.getCurrentTexture().createView(),
          },
        ],
      });

      renderPass.setPipeline(renderPipeline);
      renderPass.setVertexBuffer(0, dataBuffer);
      renderPass.setBindGroup(0, bindGroup);
      renderPass.draw(6, 1, 0, 0);
      renderPass.endPass();

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
    GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
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
      ...(isTextured
        ? [
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

  let bindGroup: GPUBindGroup;

  if (isTextured) {
    const img = await getImageFromUrl(
      imageUrl ||
        "https://images.squarespace-cdn.com/content/v1/571fc5edd210b89083925aba/1542571642279-HPT4H2FNOPFSI8685H7Y/LiamWong_MinutesToMidnight_Tokyo.jpg?format=2500w"
    );
    const bitmap = await createImageBitmap(img);

    const extent3dDict = {
      width: img.width,
      height: img.height,
      depth: 1,
    } as GPUExtent3DDict;

    const texture2d = device.createTexture({
      size: extent3dDict,
      dimension: "2d",
      format: SWAPCHAIN_FORMAT,
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING,
    });

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "nearest",
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

    bindGroup = bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: viewParamsBuffer } },
        { binding: 1, resource: sampler },
        { binding: 2, resource: texture2d.createView() },
      ],
    });
  } else {
    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: viewParamsBuffer } }],
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
    dataBuffer,
    device,
    renderPipeline,
    viewParamsBuffer
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
            // { format: "float32x2", offset: 0, shaderLocation: 0 },
            // { format: "float32x4", offset: 2 * 4, shaderLocation: 1 },
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

  // const viewParamsBindGroup = device.createBindGroup({
  //   layout: bindGroupLayout,
  //   entries: [{ binding: 0, resource: { buffer: viewParamsBuffer } }],
  // });

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

      // create uniform data
      const modelMatrix = mat4.create();
      const mvpMatrix = mat4.create();
      let vpMatrix = mat4.create();
      const vp = createViewProjection(canvas.width / canvas.height);
      vpMatrix = vp.viewProjectionMatrix;

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

export const renderShader = async (
  shaderCode: string,
  meshType: MeshType,
  renderLogger: RenderLogger,
  imageUrl?: string
): Promise<void> => {
  switch (meshType) {
    case MeshType.RECTANGLE:
      return renderRectangleShader(shaderCode, renderLogger);
    case MeshType.TEXTURED_RECTANGLE:
      return renderRectangleShader(shaderCode, renderLogger, imageUrl, true);
    case MeshType.CUBE:
      return renderCubeShader(shaderCode, renderLogger);
    default:
      return;
  }
};
