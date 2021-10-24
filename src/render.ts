import {checkWebGPU} from "./helper";

export const rectangleVertex = `
type float2 = vec2<f32>;
type float4 = vec4<f32>;
struct VertexInput {
    [[location(0)]] position: float2;
    [[location(1)]] color: float4;
};

struct VertexOutput {
    [[builtin(position)]] position: float4;
    [[location(0)]] color: float4;
};

[[block]]
struct ViewParams {
    time: f32;
};

[[group(0), binding(0)]]
var<uniform> view_params: ViewParams;

[[stage(vertex)]]
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = float4(vert.position, 0.0, 1.0);
    out.color = out.position + float4(sin(view_params.time * 0.01), sin(view_params.time * 0.01), sin(view_params.time * 0.01),0.0) ;
    return out;
};`

export const rectangleFragment = `
[[stage(fragment)]]
fn fragment_main(in: VertexOutput) -> [[location(0)]] float4 {
    return in.color;
};`

export const shaderTriangleFragment = `[[stage(fragment)]]
fn main([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return vColor;
}`

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
}`

export const renderRectangularShader = async (vertex: string, fragment: string) => {
    if (!checkWebGPU()) {
        return
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
    const adapter = await navigator.gpu!.requestAdapter()
    const device = await adapter!.requestDevice()
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext

    const shaderModule = device.createShaderModule({code: `${vertex}\n${fragment}`})
    if (shaderModule.compilationInfo) {
        const compileMessages = (await shaderModule.compilationInfo()).messages
        if (compileMessages.length > 0) {
            // compilation messages
            let error = false
            for(let i = 0; i < compileMessages.length; i++) {
                console.log(`(${compileMessages[i].lineNum},${compileMessages[i].linePos}): ${compileMessages[i].message}`)
                error = error || compileMessages[i].type === "error"
            }

            if(error) {
                console.log("Compilation failed")
                return
            }
        }
    }

    const dataBuffer = device.createBuffer({
        size: 6 * 6 * 4,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    })

    new Float32Array(dataBuffer.getMappedRange()).set([
        1, 1, 1, 0,
        0, 1, 1, -1,
        0, 1, 0, 1,
        -1, 1, 0, 0,
        1, 1, -1, -1,
        1, 0, 0, 1,
        1, -1, 0, 1,
        0, 1, -1, 1,
        0, 0, 1, 1
    ])

    dataBuffer.unmap()

    const vertexState: GPUVertexState = {
        module: shaderModule,
        entryPoint: "vertex_main",
        buffers: [{
            arrayStride: 6 * 4,
            stepMode: "vertex",
            attributes: [
                {format: "float32x4", offset: 0, shaderLocation: 0},
                {format: "float32x4", offset: 2 * 4, shaderLocation: 1}
            ]
        }]
    }

    context.configure({device: device, format: 'bgra8unorm', usage: GPUTextureUsage.RENDER_ATTACHMENT})

    const depthTexture = device.createTexture({
        size: {width: canvas.width, height: canvas.height},
        format: 'depth24plus-stencil8',
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    })

    const fragmentState: GPUFragmentState = {
        module: shaderModule,
        entryPoint: "fragment_main",
        targets: [{format: 'bgra8unorm'}]
    }

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{binding: 0, visibility: GPUShaderStage.VERTEX, buffer: [{type: "uniform"}]} as GPUBindGroupLayoutEntry]
    })

    const layout = device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout]})

    const renderPipeline = device.createRenderPipeline({
        layout: layout,
        vertex: vertexState,
        fragment: fragmentState,
        depthStencil: {format: "depth24plus-stencil8", depthWriteEnabled: true, depthCompare: "less"}
    })

    const viewParamsBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    const viewParamsBindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{binding: 0, resource: {buffer: viewParamsBuffer}}]
    })

    // track when canvas is visible and only render when true
    let canvasVisible = false
    const observer = new IntersectionObserver(e => {
        canvasVisible = e[0].isIntersecting;
    }, {threshold: [0]})
    observer.observe(canvas)

    let time = 0;
    const frame = () => {
        if(canvasVisible) {
            const upload = device.createBuffer({
                size: 4,
                usage: GPUBufferUsage.COPY_SRC,
                mappedAtCreation: true
            })

            new Float32Array(upload.getMappedRange()).set([time])
            upload.unmap()

            const renderPassDescription = {
                colorAttachments: [{view: context.getCurrentTexture().createView(), loadValue: [0.3, 0.3, 0.3, 1]}],
                depthStencilAttachment: {
                    view: depthTexture.createView(),
                    depthLoadValue: 1.0,
                    depthStoreOp: "store",
                    stencilLoadValue: 0,
                    stencilStoreOp: "store"
                }
            }

            const commandEncoder = device.createCommandEncoder()
            commandEncoder.copyBufferToBuffer(upload, 0, viewParamsBuffer, 0, 4)

            const renderPass = commandEncoder.beginRenderPass(renderPassDescription as GPURenderPassDescriptor)
            renderPass.setPipeline(renderPipeline)
            renderPass.setBindGroup(0, viewParamsBindGroup)
            renderPass.setVertexBuffer(0, dataBuffer)
            renderPass.draw(6, 1, 0, 0)

            renderPass.endPass()
            device.queue.submit([commandEncoder.finish()])
            time++
        }

        requestAnimationFrame(frame)
    }

    requestAnimationFrame(frame)
}

export const renderSimpleShader = async (vertex: string, fragment: string) => {
    const shader = {vertex, fragment}

    if (!checkWebGPU()) {
        return
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement
    const adapter = await navigator.gpu?.requestAdapter() as GPUAdapter
    const device = await adapter?.requestDevice() as GPUDevice
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext
    const format = 'bgra8unorm'

    context.configure({device, format})

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({code: shader.vertex}),
            entryPoint: "main"
        },
        fragment: {
            module: device.createShaderModule({code: shader.fragment}),
            entryPoint: "main",
            targets: [{format: format as GPUTextureFormat}]
        },
        primitive: {
            topology: "triangle-list"
        }
    })

    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            loadValue: {r: 0.0, g: 0.0, b: 0.0, a: 1.0},
            storeOp: "store"
        }]
    });

    renderPass.setPipeline(pipeline)
    renderPass.draw(3, 1, 0, 0)
    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
}

export const renderTriangle = async () => {
    renderSimpleShader(shaderTriangleVertex, shaderTriangleFragment)
}
