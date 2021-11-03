import assert from "assert";

export const checkWebGPU = (): boolean => navigator.gpu != null;

const structs = `struct VertexInput {
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
`;

export const rectangleVertex = `/*${structs}*/

[[stage(vertex)]]
fn main([[builtin(vertex_index)]] index: u32, vert: VertexInput) -> VertexOutput {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 1.0),
        vec2<f32>(view_params.x, view_params.y),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(-1.0, -1.0)
    );
    
    var color = array<vec3<f32>, 6>(
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0),
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0)
    );

    var out: VertexOutput;
    out.position = vec4<f32>(pos[index], 0.0, 1.0);
    out.color = vert.color + vec4<f32>(color[index], 1.0);
    return out;
};`;

export const rectangleFragment = `[[stage(fragment)]]
fn main([[location(0)]] color: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return sin(view_params.time * 0.01) * color;
};`;

export const shaderTriangleFragment = `[[stage(fragment)]]
fn main([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return vColor;
}
`;

export const shaderTriangleVertex = `struct Output {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] vColor : vec4<f32>;
};

[[stage(vertex)]]
fn main([[builtin(vertex_index)]] index: u32) -> Output {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );
    
    var color = array<vec3<f32>, 3>(
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0)
    );
    
    var output: Output;
    output.Position = vec4<f32>(pos[index], 0.0, 1.0);
    output.vColor = vec4<f32>(color[index], 1.0);
    
    return output;
}
`;

const outputMessages = async (shaderModule: GPUShaderModule) => {
  if (shaderModule.compilationInfo) {
    const messages = (await shaderModule.compilationInfo()).messages;
    if (messages.length > 0) {
      let error = false;
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(
          `(${message.lineNum}, ${message.linePos}): ${message.message}`
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

export const renderShader = async (
  vertex: string,
  fragment: string
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

  // allocate a buffer for up to 6 vertices
  const dataBuffer = device.createBuffer({
    size: 6 * 6 * 4,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  // this float 32 array is not necessary,
  // but with it you can do some cool things using the
  // VertexInput in the shader
  new Float32Array(dataBuffer.getMappedRange()).set([
    0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0,
    0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1,
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
      module: vertexShaderModule,
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 6 * 4,
          stepMode: "vertex",
          attributes: [
            { format: "float32x4", offset: 0, shaderLocation: 0 },
            { format: "float32x4", offset: 2 * 4, shaderLocation: 1 },
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

      new Float32Array(upload.getMappedRange()).set([time]);
      upload.unmap();

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
            loadValue: [0.0, 0.0, 0.0, 0.0],
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
      commandEncoder.copyBufferToBuffer(upload, 0, viewParamsBuffer, 0, 4);
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
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

export const renderTriangle = (): void => {
  renderShader(shaderTriangleVertex, shaderTriangleFragment);
};
