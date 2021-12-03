import assert from "assert";
import { RenderLogger } from "./objects/RenderLogger";

export const checkWebGPU = (): boolean => navigator.gpu != null;

const NUM_PARTICLES = 2000;
const PARTICLE_SIZE = 7;

//const PARTICLE_STRIDE = NUM_PARTICLES * 16;

const computeCode = `
  // can access in array by positionsIn.in[]
  [[block]] struct ParticleProperty {
    all: [[stride(16)]] array<vec4<f32>>;
  };
  [[block]] struct Mass {
    mass1Position: vec4<f32>;
    mass2Position: vec4<f32>;
    mass3Position: vec4<f32>;
    mass1Factor: f32;
    mass2Factor: f32;
    mass3Factor: f32;
  };

  [[group(0), binding(0)]] var<storage, read> positionsIn: ParticleProperty;
  [[group(0), binding(1)]] var<storage, read> velocityIn: ParticleProperty;
  [[group(0), binding(2)]] var<storage, write> positionsOut: ParticleProperty;
  [[group(0), binding(3)]] var<storage, write> velocityOut: ParticleProperty;
  [[group(0), binding(4)]] var<uniform> m: Mass;


  [[stage(compute), workgroup_size(64)]]
  fn compute_main([[builtin(global_invocation_id)]] GlobalInvocationID : vec3<u32>) {
    var index: u32 = GlobalInvocationID.x;
    
    var position = vec3<f32>(positionsIn.all[index][0], positionsIn.all[index][1], positionsIn.all[index][2]);
    var velocity = vec3<f32>(velocityIn.all[index][0], velocityIn.all[index][1], velocityIn.all[index][2]);

    var massVec = vec3<f32>(m.mass1Position[0], m.mass1Position[1], m.mass1Position[2]) - position;
    var massDist2 = max(0.01, dot(massVec, massVec));
    var acceleration = m.mass1Factor * normalize(massVec) / massDist2;
    massVec = vec3<f32>(m.mass2Position[0], m.mass2Position[1], m.mass2Position[2]) - position;
    massDist2 = max(0.01, dot(massVec, massVec));
    acceleration = acceleration + (m.mass2Factor * normalize(massVec) / massDist2);
    massVec = vec3<f32>(m.mass3Position[0], m.mass3Position[1], m.mass3Position[2]) - position;
    massDist2 = max(0.01, dot(massVec, massVec));
    acceleration = acceleration + (m.mass3Factor * normalize(massVec) / massDist2);

    velocity = velocity + acceleration;
    velocity = velocity * 0.9999;

    positionsOut.all[index] = vec4<f32>(position + velocity, 1.0);
    velocityOut.all[index] = vec4<f32>(velocity, 0.0);
  };
`;

/* var index: u32 = GlobalInvocationID.x;
var position = vec3<f32>(positionsIn.all[index][0], positionsIn.all[index][1], positionsIn.all[index][2]);
    var velocity = vec3<f32>(velocityIn.all[index][0], velocityIn.all[index][1], velocityIn.all[index][2]);

    var massVec = vec3<f32>(m.mass1Position[0], m.mass1Position[1], m.mass1Position[2]) - position;
    var massDist2 = max(0.01, dot(massVec, massVec));
    var acceleration = m.mass1Factor * normalize(massVec) / massDist2;
    massVec = vec3<f32>(m.mass2Position[0], m.mass2Position[1], m.mass2Position[2]) - position;
    massDist2 = max(0.01, dot(massVec, massVec));
    acceleration = acceleration + (m.mass2Factor * normalize(massVec) / massDist2);
    massVec = vec3<f32>(m.mass3Position[0], m.mass3Position[1], m.mass3Position[2]) - position;
    massDist2 = max(0.01, dot(massVec, massVec));
    acceleration = acceleration + (m.mass3Factor * normalize(massVec) / massDist2);

    velocity = velocity + acceleration;
    velocity = velocity * 0.9999;

    positionsOut.all[index] = vec4<f32>(position + velocity, 1.0);
    velocityOut.all[index] = vec4<f32>(velocity, 0.0);*/

export const structs = `struct VertexInput {
    [[location(0)]] position: vec2<f32>;
    [[location(1)]] color: vec4<f32>;
    [[location(2)]] sndPosition: vec3<f32>;
};

struct VertexOutput {
    [[builtin(position)]] position: vec4<f32>;
    [[location(0)]] color: vec4<f32>;
};

[[block]]
struct ViewParams {
    screenDimensions: vec2<f32>;
    particleSize: f32;
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
/*[[block]]
struct ViewParams {
    screenDimensions: vec2<f32>;
    particleSize: f32;
};*/

[[group(0), binding(0)]] var<uniform> viewParams: ViewParams;

[[stage(vertex)]]
fn vertex_main([[location(0)]] position: vec2<f32>, [[location(1)]] color: vec4<f32>, [[location(2)]] sndPosition: vec3<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(position * viewParams.particleSize / viewParams.screenDimensions + vec2<f32>(sndPosition[0], sndPosition[1]), sndPosition[2], 1.0);
    out.color = color;
    return out;
};`;

export const rectangleFragment = `[[stage(fragment)]]
fn fragment_main([[location(0)]] color: vec4<f32>) -> [[location(0)]] vec4<f32> {
    var a = color[3];
    return vec4<f32>(color[0] * a, color[1] * a, color[2] * a, color[3]);
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
  /*const splitOnFragmentDecl = shaderCode.split("[[stage(fragment)]]");
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
  );*/
  return shaderCode;
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
          }`,
          message.type
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
  if (x == y) {
    x = y;
  }
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
    renderLogger.logMessage("Shader Compilation failed", "error");
    return;
  }

  renderLogger.logMessage("Shader Compilation successful", "success");

  // cancel the previous render once we know the next render will compile
  if (renderFrame != -1) {
    cancelAnimationFrame(renderFrame);
    renderFrame = -1;
  }

  // COMPUTE CODE STARTS HERE FOR A BIT
  const positionBufferA = device.createBuffer({
    size: 16 * NUM_PARTICLES * 4,
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
    size: 16 * NUM_PARTICLES * 4,
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
    size: 16 * NUM_PARTICLES * 4,
    usage:
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    mappedAtCreation: true,
  });

  positionBufferB.unmap();

  const velocityBufferB = device.createBuffer({
    size: 16 * NUM_PARTICLES * 4,
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
    size: 4 * NUM_PARTICLES * 4,
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
    size: 4 * 6,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // COMPUTE CODE
  device.queue.writeBuffer(
    viewParamsBuffer,
    0,
    new Float32Array([canvas.width, canvas.height, PARTICLE_SIZE])
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

  //let time = 0;
  //const res_x = canvas.width;
  //const res_y = canvas.height;
  const frame = () => {
    if (canvasVisible) {
      /*const timeBuffer = device.createBuffer({
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
      resYBuffer.unmap();*/

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
      const commandEncoder = device.createCommandEncoder();
      // commandEncoder.copyBufferToBuffer(timeBuffer, 0, viewParamsBuffer, 0, 4);
      // commandEncoder.copyBufferToBuffer(xBuffer, 0, viewParamsBuffer, 4, 4);
      // commandEncoder.copyBufferToBuffer(yBuffer, 0, viewParamsBuffer, 8, 4);
      // commandEncoder.copyBufferToBuffer(resXBuffer, 0, viewParamsBuffer, 12, 4);
      // commandEncoder.copyBufferToBuffer(resYBuffer, 0, viewParamsBuffer, 16, 4);

      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(computePipeline);
      computePass.setBindGroup(0, currentComputeBindGroup);
      computePass.dispatch(NUM_PARTICLES);
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
      renderPass.draw(4, NUM_PARTICLES, 0, 0);

      renderPass.endPass();
      device.queue.submit([commandEncoder.finish()]);
      //time++;

      currentPositionBuffer =
        currentPositionBuffer === positionBufferA
          ? positionBufferB
          : positionBufferA;
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
