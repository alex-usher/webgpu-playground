import assert from "assert";
import { structs } from "./shaders";
import {
  checkWebGPU,
  outputMessages,
  CreateGPUBuffer,
  CreateTransforms,
  CreateViewProjection,
} from "./helpers";
import { cubeColours, cubePositions } from "./meshes";
import { mat4 } from "gl-matrix";

let x = 0;
let y = 0;

export const updateCoordinates = (position: { x: number; y: number }): void => {
  x = position.x;
  y = position.y;
};

export const renderShader = async (
  vertex: string,
  fragment: string
): Promise<void> => {
  if (!checkWebGPU()) {
    return;
  }

  // --------------------------------------------------------------------------------------
  // Initialise GPU
  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;

  assert(navigator.gpu);
  const adapter = await navigator.gpu.requestAdapter();

  assert(adapter);
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;

  const stateFormat = "bgra8unorm";
  const depthFormat = "depth24plus-stencil8";

  context.configure({
    device: device,
    format: stateFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  // --------------------------------------------------------------------------------------
  // Load Shader Code
  const vertexShaderModule = device.createShaderModule({
    code: `${structs}\n${vertex}`,
  });

  const fragmentShaderModule = device.createShaderModule({
    code: `${structs}\n${fragment}`,
  });

  // check for compilation failures and output any compile messages
  if (!(await outputMessages(vertexShaderModule))) {
    console.log("Vertex Shader Compilation failed");
    return;
  }

  if (!(await outputMessages(fragmentShaderModule))) {
    console.log("Fragment Shader Compilation failed");
    return;
  }
  // --------------------------------------------------------------------------------------
  // create buffers
  const numberOfVertices = cubePositions.length / 3;
  const vertexBuffer = CreateGPUBuffer(device, cubePositions);
  const colorBuffer = CreateGPUBuffer(device, cubeColours);

  // --------------------------------------------------------------------------------------
  // Define  layouts
  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
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
      module: vertexShaderModule,
      entryPoint: "main",
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
      module: fragmentShaderModule,
      entryPoint: "main",
      targets: [{ format: stateFormat }],
    },
    depthStencil: {
      format: depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const viewParamsBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

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

  let time = 0;
  const frame = () => {
    if (canvasVisible) {
      const upload = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });

      const xBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });

      const yBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });

      new Float32Array(upload.getMappedRange()).set([time]);
      upload.unmap();

      new Float32Array(xBuffer.getMappedRange()).set([x]);
      xBuffer.unmap();

      new Float32Array(yBuffer.getMappedRange()).set([y]);
      yBuffer.unmap();

      const renderPassDescription = {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadValue: [0.0, 0.0, 0.0, 0.0],
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
      const vp = CreateViewProjection(canvas.width / canvas.height);
      vpMatrix = vp.viewProjectionMatrix;

      CreateTransforms(modelMatrix);
      mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
      device.queue.writeBuffer(viewParamsBuffer, 0, mvpMatrix as ArrayBuffer);

      const commandEncoder = device.createCommandEncoder();
      // commandEncoder.copyBufferToBuffer(upload, 0, viewParamsBuffer, 0, 4);
      commandEncoder.copyBufferToBuffer(xBuffer, 0, viewParamsBuffer, 4, 4);
      commandEncoder.copyBufferToBuffer(yBuffer, 0, viewParamsBuffer, 8, 4);

      const renderPass = commandEncoder.beginRenderPass(
        renderPassDescription as GPURenderPassDescriptor
      );
      renderPass.setPipeline(renderPipeline);
      renderPass.setBindGroup(0, viewParamsBindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setVertexBuffer(1, colorBuffer);
      renderPass.draw(numberOfVertices);
      renderPass.endPass();

      device.queue.submit([commandEncoder.finish()]);
      time++;
    }
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};
