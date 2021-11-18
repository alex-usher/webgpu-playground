import assert from "assert";
import { RenderLogger } from "./objects/RenderLogger";

export const checkWebGPU = (): boolean => navigator.gpu != null;

export const structs = `struct VertexInput {
    [[location(0)]] position: vec2<f32>;
    [[location(1)]] color: vec4<f32>;
};

struct VertexOutput {
    [[builtin(position)]] position: vec4<f32>;
    [[location(0)]] color: vec4<f32>;
};

[[block]]
struct ViewParams {
    time: f32;
    x: f32;
    y: f32;
    res_x: f32;
    res_y: f32;
};

[[group(0), binding(0)]]
var<uniform> view_params: ViewParams;

// AVAILABLE UNIFORMS (pre-declared, available globally):
// - res (resolution): vec2<f32>(width, height);
// - pos (pixel position): vec2<f32>(x, y);
// - time (elapsed since render): f32;
// - mouse (mouse position): vec2<f32>(x, y);
`;
const structsLength = structs.split(/\r\n|\r|\n/).length + 1;

const structsMessage =
  "To see the predefined uniforms that you have available to you, click the help button above";
export const rectangleVertex = `/*${structsMessage}*/
[[stage(vertex)]]
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(vert.position, 0.0, 1.0);
    out.color = vert.color;
    return out;
};`;

export const rectangleFragment = `[[stage(fragment)]]
fn fragment_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
  var out = sin(time * 0.01) * in.color;
  if (pos[0] < res[0]/2.0) {
      out = sin(time * 0.01 + 3.14) * in.color;
  }
  if (length(mouse - pos) < 10.0) {
      out = vec4<f32>(1.0, 1.0, 1.0, 1.0);
  } 
  return out;
};`;

export const shaderTriangleFragment = `[[stage(fragment)]]
fn fragment_main([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return vColor;
}
`;

export const shaderTriangleVertex = `struct Output {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] vColor : vec4<f32>;
};

[[stage(vertex)]]
fn vertex_main([[builtin(vertex_index)]] index: u32) -> Output {
    var output: Output;
    output.Position = vec4<f32>(pos[index], 0.0, 1.0);
    output.vColor = vec4<f32>(color[index], 1.0);
    return output;
}
`;

const addUniformCode = (shaderCode: string): string => {
  const splitOnFragmentDecl = shaderCode.split("[[stage(fragment)]]");
  const splitInFragmentDecl = splitOnFragmentDecl[1].split(
    RegExp(/{([\s\S]*)/),
    2
  );
  const globalVars =
    "\nvar<private> res: vec2<f32>;\n" +
    "var<private> pos: vec2<f32>;\n" +
    "var<private> time: f32;\n" +
    "var<private> mouse: vec2<f32>;\n";
  const uniformBoilerplate =
    "\nres = vec2<f32>(view_params.res_x, view_params.res_y);\n" +
    "pos = vec2<f32>(in.position[0], in.position[1]);\n" +
    "time = view_params.time;\n" +
    "mouse = vec2<f32>(view_params.x, view_params.y);\n";

  console.log(splitInFragmentDecl[0]);
  console.log(splitInFragmentDecl[1]);

  return (
    globalVars +
    splitOnFragmentDecl[0] +
    "[[stage(fragment)]]" +
    splitInFragmentDecl[0] +
    "{" +
    uniformBoilerplate +
    splitInFragmentDecl[1]
  );
};

const outputMessages = async (
  shaderModule: GPUShaderModule,
  renderLogger: RenderLogger
) => {
  if (shaderModule.compilationInfo) {
    const messages = (await shaderModule.compilationInfo()).messages;
    if (messages.length > 0) {
      let error = false;
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        renderLogger.logMessage(
          `(${message.lineNum - structsLength}, ${message.linePos}): ${
            message.message
          }`
        );
        error = error || message.type === "error";
      }

      return !error;
    }

    return true;
  }

  return false;
};

let x = 0;
let y = 0;

export const updateCoordinates = (position: { x: number; y: number }): void => {
  x = position.x;
  y = position.y;
};

let renderFrame = -1;

export const renderShader = async (
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
    renderLogger.logMessage("Shader Compilation failed");
    return;
  }

  renderLogger.logMessage("Shader Compilation successful");

  // cancel the previous render once we know the next render will compile
  if (renderFrame != -1) {
    cancelAnimationFrame(renderFrame);
  }

  // allocate a buffer for up to 6 vertices
  const dataBuffer = device.createBuffer({
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

  dataBuffer.unmap();

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

      const commandEncoder = device.createCommandEncoder();
      commandEncoder.copyBufferToBuffer(timeBuffer, 0, viewParamsBuffer, 0, 4);
      commandEncoder.copyBufferToBuffer(xBuffer, 0, viewParamsBuffer, 4, 4);
      commandEncoder.copyBufferToBuffer(yBuffer, 0, viewParamsBuffer, 8, 4);
      commandEncoder.copyBufferToBuffer(resXBuffer, 0, viewParamsBuffer, 12, 4);
      commandEncoder.copyBufferToBuffer(resYBuffer, 0, viewParamsBuffer, 16, 4);
      const renderPass = commandEncoder.beginRenderPass(
        renderPassDescription as GPURenderPassDescriptor
      );
      renderPass.setPipeline(renderPipeline);
      renderPass.setBindGroup(0, viewParamsBindGroup);
      renderPass.setVertexBuffer(0, dataBuffer);
      renderPass.draw(6, 1, 0, 0);

      renderPass.endPass();
      device.queue.submit([commandEncoder.finish()]);
      time++;
    }

    renderFrame = requestAnimationFrame(frame);
  };

  renderFrame = requestAnimationFrame(frame);
};

export const renderTriangle = (): void => {
  renderShader(
    `${shaderTriangleVertex}\n${shaderTriangleFragment}`,
    new RenderLogger()
  );
};
