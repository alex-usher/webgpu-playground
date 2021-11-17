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
`;

export const structsLength = structs.split(/\r\n|\r|\n/).length + 1;

export const rectangleVertex = `/*${structs}*/

[[stage(vertex)]]
fn vertex_main([[builtin(vertex_index)]] index: u32, vert: VertexInput) -> VertexOutput {
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
fn fragment_main([[location(0)]] color: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return sin(view_params.time * 0.01) * color;
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

export const cubeVertex = `
[[block]] struct Uniforms {
    mvpMatrix : mat4x4<f32>;
};
[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;
[[stage(vertex)]]
fn vertex_main([[location(0)]] pos: vec4<f32>, [[location(1)]] color: vec4<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.mvpMatrix * pos;
    output.color = color;
    return output;
}`;

export const cubeFragment = `
[[stage(fragment)]]
fn fragment_main([[location(0)]] color: vec4<f32>) -> [[location(0)]] vec4<f32> {
    return color;
}`;
