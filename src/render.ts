import {checkWebGPU} from "./helper";

const shaderTriangle = () => {
    const vertex = `
        struct Output {
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

    const fragment = `
        [[stage(fragment)]]
        fn main([[location(0)]] vColor: vec4<f32>) -> [[location(0)]] vec4<f32> {
            return vColor;
        }
    `;

    return {vertex, fragment};
}

export const renderTriangle = async () => {
    if (!checkWebGPU()) {
        return
    }

    const canvas = document.getElementById('canvas-webgpu') as HTMLCanvasElement;
    const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
    const device = await adapter.requestDevice() as GPUDevice;
    const context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
    const format = 'bgra8unorm';

    context.configure({device, format});

    const shader = shaderTriangle();
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
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            loadValue: {r: 0.0, g: 0.0, b: 0.0, a: 1.0},
            storeOp: "store"
        }]
    });

    renderPass.setPipeline(pipeline);
    renderPass.draw(3, 1, 0, 0);
    renderPass.endPass();

    device.queue.submit([commandEncoder.finish()]);
}
