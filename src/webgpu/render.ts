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
import { RenderLogger } from "../objects/RenderLogger";
import { MeshType } from "../objects/Shader";
import { getImageFromUrl } from "../utils/imageHelper";

let x = 0;
let y = 0;

export const updateCoordinates = (position: { x: number; y: number }): void => {
  x = position.x;
  y = position.y;
};

let renderFrame = -1;

export const renderTexturedShader = async (
  shaderCode: string,
  renderLogger: RenderLogger
): Promise<void> => {
  if (!checkWebGPU()) {
    return;
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;

  assert(navigator.gpu);
  const adapter = await navigator.gpu.requestAdapter();
  assert(adapter);
  const device = await adapter.requestDevice();
  // part of pipeline requires cast to unknown before cast to GPUCanvasContext
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;
  const swapchainFormat = "bgra8unorm";

  context.configure({
    device: device,
    format: swapchainFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });

  const shaderModule = device.createShaderModule({
    code: `${structs}\n${shaderCode}`,
  });

  // check for compilation failures and output any compile messages
  if (!(await outputMessages(shaderModule, renderLogger))) {
    renderLogger.logMessage("Shader Compilation failed");
    return;
  }

  renderLogger.logMessage("Shader Compilation successful");

  const dataBuffer = device.createBuffer({
    size: 6 * 6 * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  const viewParamsBuffer = device.createBuffer({
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // define vertices + colours
  new Float32Array(dataBuffer.getMappedRange()).set([
    -1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0,
    1.0, 0.0, 0.0, 0.0, -1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0,
    0.0, -1.0, 1.0, 0.0, 0.0, 0.0, 0.0,
  ]);

  dataBuffer.unmap();

  const img = await getImageFromUrl(
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
    format: swapchainFormat,
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

  const viewParamsBindGroupLayout = device.createBindGroupLayout({
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
    ],
  });

  const renderPipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [viewParamsBindGroupLayout],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: renderPipelineLayout,
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
      targets: [{ format: swapchainFormat }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  // const bindGroupLayout = device.createBindGroupLayout({
  //   entries: [
  //     {
  //       binding: 0,
  //       visibility: GPUShaderStage.FRAGMENT,
  //       type: "sampler",
  //     } as GPUBindGroupLayoutEntry,
  //     {
  //       binding: 1,
  //       visibility: GPUShaderStage.FRAGMENT,
  //       type: "sampled-texture",
  //     } as GPUBindGroupLayoutEntry,
  //   ],
  // });

  // const bindGroup = device.createBindGroup({
  //   layout: bindGroupLayout,
  //   entries: [
  //     { binding: 0, resource: sampler },
  //     { binding: 1, resource: texture2d.createView() },
  //   ],
  // });

  const viewParamsBindGroup = device.createBindGroup({
    layout: viewParamsBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: viewParamsBuffer } },
      { binding: 1, resource: sampler },
      { binding: 2, resource: texture2d.createView() },
    ],
  });

  const commandEncoder = device.createCommandEncoder();

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
  renderPass.setBindGroup(0, viewParamsBindGroup);
  // renderPass.setBindGroup(1, bindGroup);
  renderPass.draw(6, 1, 0, 0);
  renderPass.endPass();

  device.queue.submit([commandEncoder.finish()]);
};

export const renderShader = async (
  shaderCode: string,
  meshType: MeshType,
  renderLogger: RenderLogger
): Promise<void> => {
  if (meshType === MeshType.TEXTURED_RECTANGLE) {
    return renderTexturedShader(shaderCode, renderLogger);
  }

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
  const shaderModule = device.createShaderModule({
    code: `${structs}\n${shaderCode}`,
  });
  // check for compilation failures and output any compile messages
  if (!(await outputMessages(shaderModule, renderLogger))) {
    renderLogger.logMessage("Shader Compilation failed");
    return;
  }

  renderLogger.logMessage("Shader Compilation successful");

  // cancel the previous render once we know the next render will compile
  if (renderFrame != -1) {
    cancelAnimationFrame(renderFrame);
  }
  // --------------------------------------------------------------------------------------
  // create buffers
  const numberOfVertices = cubePositions.length / 3;
  const vertexBuffer = CreateGPUBuffer(device, cubePositions);
  const colorBuffer = CreateGPUBuffer(device, cubeColours);

  // --------------------------------------------------------------------------------------
  // Define  layouts

  // // allocate a buffer for up to 6 vertices
  // const dataBuffer = device.createBuffer({
  //   size: 6 * 6 * 4,
  //   usage: GPUBufferUsage.VERTEX,
  //   mappedAtCreation: true,
  // });

  // // this float 32 array is not necessary,
  // // but with it you can do some cool things using the
  // // VertexInput in the shader
  // new Float32Array(dataBuffer.getMappedRange()).set([
  //   1, 1, 1, 0, 0, 1, 1, -1, 0, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1,
  //   -1, 1, 0, 1, 0, 1, -1, -1, 0, 0, 1, 1,
  // ]);

  // dataBuffer.unmap();

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
      targets: [{ format: stateFormat }],
    },
    depthStencil: {
      format: depthFormat,
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const viewParamsBuffer = device.createBuffer({
    size: 4 * 5,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const viewParamsBindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: viewParamsBuffer } }],
  });

  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
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
      const timeBuffer = device.createBuffer({
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

      const resXBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });

      const resYBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true,
      });

      new Float32Array(timeBuffer.getMappedRange()).set([time]);
      timeBuffer.unmap();

      new Float32Array(xBuffer.getMappedRange()).set([x]);
      xBuffer.unmap();

      new Float32Array(yBuffer.getMappedRange()).set([y]);
      yBuffer.unmap();

      new Float32Array(resXBuffer.getMappedRange()).set([res_x]);
      resXBuffer.unmap();

      new Float32Array(resYBuffer.getMappedRange()).set([res_y]);
      resYBuffer.unmap();

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
      const vp = CreateViewProjection(canvas.width / canvas.height);
      vpMatrix = vp.viewProjectionMatrix;

      CreateTransforms(modelMatrix);
      mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
      device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);

      const commandEncoder = device.createCommandEncoder();

      if (meshType === MeshType.RECTANGLE) {
        console.log("WIHNODIAHNOd");
        commandEncoder.copyBufferToBuffer(
          timeBuffer,
          0,
          viewParamsBuffer,
          0,
          4
        );
        commandEncoder.copyBufferToBuffer(xBuffer, 0, viewParamsBuffer, 4, 4);
        commandEncoder.copyBufferToBuffer(yBuffer, 0, viewParamsBuffer, 8, 4);
        commandEncoder.copyBufferToBuffer(
          resXBuffer,
          0,
          viewParamsBuffer,
          12,
          4
        );
        commandEncoder.copyBufferToBuffer(
          resYBuffer,
          0,
          viewParamsBuffer,
          16,
          4
        );
      }

      const renderPass = commandEncoder.beginRenderPass(
        renderPassDescription as GPURenderPassDescriptor
      );
      renderPass.setPipeline(renderPipeline);
      if (meshType === MeshType.RECTANGLE) {
        renderPass.setBindGroup(0, viewParamsBindGroup);
      } else if (meshType === MeshType.CUBE) {
        renderPass.setBindGroup(0, uniformBindGroup);
      }
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