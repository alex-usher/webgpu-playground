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
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;

  context.configure({
    device: device,
    format: SWAPCHAIN_FORMAT,
    usage: usage,
  });

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
            texture: context.getCurrentTexture(),
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

export const renderParticleShader = async (
  shaderCode: string,
  renderLogger: RenderLogger,
  numParticles: number,
  computeCode: string
): Promise<void> => {
  if (!checkWebGPU()) {
    return;
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;

  assert(navigator.gpu);
  const adapter = await navigator.gpu.requestAdapter();

  assert(adapter);
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;

  const stateFormat = "bgra8unorm";
  const depthFormat = "depth24plus-stencil8";

  // add in uniform constant code in fragment shader
  shaderCode = addUniformCode(shaderCode);

  const shaderModule = device.createShaderModule({
    code: `${structs}\n${shaderCode}`,
  });
  // check for compilation failures and output any compile messages
  if (!(await outputMessages(shaderModule, renderLogger))) {
    renderLogger.logMessage("Shader Compilation failed", "error");
    return;
  }

  renderLogger.logMessage("Shader Compilation successful", "success");

  // cancel the previous render once we know the next render will compile
  if (renderFrame != -1) {
    cancelAnimationFrame(renderFrame);
  }

  // COMPUTE CODE STARTS HERE FOR A BIT
  const positionBufferA = device.createBuffer({
    size: 16 * numParticles * 4,
    usage:
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  const positionBufferData = new Float32Array(positionBufferA.getMappedRange());
  for (let i = 0; i < positionBufferData.length; i += 4) {
    positionBufferData[i] = Math.random() * 2 - 1;
    positionBufferData[i + 1] = Math.random() * 2 - 1;
    positionBufferData[i + 2] = Math.random() * 2 - 1;
    positionBufferData[i + 3] = 1;
  }
  positionBufferA.unmap();

  const velocityBufferA = device.createBuffer({
    size: 16 * numParticles * 4,
    usage:
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  const velocityBufferData = new Float32Array(velocityBufferA.getMappedRange());
  for (let i = 0; i < velocityBufferData.length; i += 4) {
    velocityBufferData[i] = Math.random() * 0.002 - 0.001;
    velocityBufferData[i + 1] = Math.random() * 0.002 - 0.001;
    velocityBufferData[i + 2] = 0;
    velocityBufferData[i + 3] = 1;
  }
  velocityBufferA.unmap();

  const positionBufferB = device.createBuffer({
    size: 16 * numParticles * 4,
    usage:
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  positionBufferB.unmap();

  const velocityBufferB = device.createBuffer({
    size: 16 * numParticles * 4,
    usage:
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  velocityBufferB.unmap();

  // COMPUTE CODE ENDS HERE NOW IF THE VERTICES ARE FUCKED COME CHANGE THESE NUMBERS

  // allocate a buffer for up to 6 vertices
  /*const dataBuffer = device.createBuffer({
    size: 6 * 6 * 4,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  // this float 32 array is not necessary,
  // but with it you can do some cool things using the
  // VertexInput in the shader
  new Float32Array(dataBuffer.getMappedRange()).set([
    1, 1, 1, 0, 0, 1, 1, -1, 0, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1,
    -1, 1, 0, 1, 0, 1, -1, -1, 0, 0, 1, 1,
  ]);

  dataBuffer.unmap();*/

  const vertexBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });

  new Float32Array(vertexBuffer.getMappedRange()).set([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
  ]);

  vertexBuffer.unmap();

  // COMPUTE CODE STARTS AGAIN

  const particleBuffer = device.createBuffer({
    size: 4 * numParticles * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  const particleBufferData = new Uint8Array(particleBuffer.getMappedRange());
  for (let i = 0; i < particleBufferData.length; i += 4) {
    particleBufferData[i] = Math.floor(Math.random() * 256);
    particleBufferData[i + 1] = Math.floor(Math.random() * 256);
    particleBufferData[i + 2] = Math.floor(Math.random() * 256);
    particleBufferData[i + 3] = 128;
  }
  particleBuffer.unmap();

  const computeUniformData = new Float32Array([
    Math.random() * 2.0 - 1.0,
    Math.random() * 2.0 - 1.0,
    0,
    1.0,
    Math.random() * 2.0 - 1.0,
    Math.random() * 2.0 - 1.0,
    0,
    1.0,
    Math.random() * 2.0 - 1.0,
    Math.random() * 2.0 - 1.0,
    0,
    1.0,
    Math.random() / 30000,
    Math.random() / 30000,
    Math.random() / 30000,
    0,
  ]);

  const computeUniformBuffer = device.createBuffer({
    size: computeUniformData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(computeUniformBuffer, 0, computeUniformData);

  //computeUniformBuffer.unmap();

  const computeBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const computeBindGroupA2B = device.createBindGroup({
    layout: computeBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: positionBufferA,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: velocityBufferA,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: positionBufferB,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: velocityBufferB,
        },
      },
      {
        binding: 4,
        resource: {
          buffer: computeUniformBuffer,
        },
      },
    ],
  });

  const computeBindGroupB2A = device.createBindGroup({
    layout: computeBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: positionBufferB,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: velocityBufferB,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: positionBufferA,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: velocityBufferA,
        },
      },
      {
        binding: 4,
        resource: {
          buffer: computeUniformBuffer,
        },
      },
    ],
  });

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [computeBindGroupLayout],
    }),
    compute: {
      module: device.createShaderModule({
        code: computeCode,
      }),
      entryPoint: "compute_main",
    },
  });

  // COMPUTE CODE ENDS HERE. MIGHT PROB NEED TO CHECK VERTEX UNIFORM BUFFER/VIEW PARAMS BUFFER

  context.configure({
    device: device,
    format: stateFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const depthTexture = device.createTexture({
    size: { width: canvas.width, height: canvas.height },
    format: depthFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

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
          arrayStride: 8,
          attributes: [{ format: "float32x2", offset: 0, shaderLocation: 0 }],
        },
        {
          arrayStride: 4,
          stepMode: "instance",
          attributes: [{ format: "unorm8x4", offset: 0, shaderLocation: 1 }],
        },
        {
          arrayStride: 16,
          stepMode: "instance",
          attributes: [{ format: "float32x4", offset: 0, shaderLocation: 2 }],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [{ format: stateFormat }],
      // COMPUTE CODE CBA TO IMPLEMENT COLOR BLEND AND ALPHA BLEND
    },
    // COMPUTE CODE ALSO MISSING PRIMITIVE
    primitive: {
      topology: "triangle-strip",
      stripIndexFormat: "uint32",
    },
    depthStencil: {
      format: depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const viewParamsBuffer = device.createBuffer({
    // COMPUTE CODE KIND OF
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // COMPUTE CODE
  device.queue.writeBuffer(
    viewParamsBuffer,
    0,
    new Float32Array([canvas.width, canvas.height])
  );

  //viewParamsBuffer.unmap();

  const viewParamsBindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: viewParamsBuffer } }],
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

  let currentPositionBuffer = positionBufferB;

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

      // COMPUTE CODE STARTS HERE AGAIN

      const currentComputeBindGroup =
        currentPositionBuffer === positionBufferA
          ? computeBindGroupB2A
          : computeBindGroupA2B;

      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(computePipeline);
      computePass.setBindGroup(0, currentComputeBindGroup);
      computePass.dispatch(numParticles);
      computePass.endPass();
      renderPassDescription.colorAttachments[0].view = context
        .getCurrentTexture()
        .createView();
      const renderPass = commandEncoder.beginRenderPass(
        renderPassDescription as GPURenderPassDescriptor
      );
      renderPass.setPipeline(renderPipeline);
      renderPass.setBindGroup(0, viewParamsBindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setVertexBuffer(1, particleBuffer);
      renderPass.setVertexBuffer(2, currentPositionBuffer);
      renderPass.draw(4, numParticles, 0, 0);

      renderPass.endPass();
      device.queue.submit([commandEncoder.finish()]);
      time++;

      currentPositionBuffer =
        currentPositionBuffer === positionBufferA
          ? positionBufferB
          : positionBufferA;
    }

    renderFrame = requestAnimationFrame(frame);
  };

  renderFrame = requestAnimationFrame(frame);
};

export const renderShader = async (
  shaderCode: string,
  meshType: MeshType,
  renderLogger: RenderLogger,
  vertices: string,
  colours: string,
  vertexCount: string,
  imageUrl?: string,
  computeCode?: string
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
    case MeshType.PARTICLES:
      if (computeCode) {
        return renderParticleShader(
          shaderCode,
          renderLogger,
          2000,
          computeCode
        );
      }
      break;
    default:
      return;
  }
};
