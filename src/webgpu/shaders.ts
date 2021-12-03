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

export const texture2dShader = `
[[group(0), binding(1)]] var frame_sampler: sampler;
[[group(0), binding(2)]] var previous_frame: texture_2d<f32>;
[[group(0), binding(3)]] var my_sampler: sampler;
[[group(0), binding(4)]] var my_texture: texture_2d<f32>;

[[stage(vertex)]]
fn vertex_main(vert: VertexInput) -> VertexOutput
{
    var output : VertexOutput;
    output.position = vec4<f32>(vert.position, 0.0, 1.0);
    output.color = vert.color;
    return output;
}

[[stage(fragment)]]
fn fragment_main(in: VertexOutput) -> [[location(0)]] vec4<f32>
{
    return textureSample(my_texture, my_sampler, in.color.xy);
}`;

export const structsLength = structs.split(/\r\n|\r|\n/).length + 1;

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

export const rectangleFragment = `
[[group(0), binding(1)]] var frame_sampler: sampler;
[[group(0), binding(2)]] var previous_frame: texture_2d<f32>;

[[stage(fragment)]]
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
fn fragment_main(in: VertexOutput) -> [[location(0)]] vec4<f32> {
    return in.color;
}`;
