export const structs = `struct VertexInput {
    @location(0) position: vec2<f32>,
    @location(1) color: vec4<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
}

struct ViewParams {
    time: f32,
    x: f32,
    y: f32,
    res_x: f32,
    res_y: f32,
}

@group(0) @binding(0)
var<uniform> view_params: ViewParams;

// AVAILABLE UNIFORMS (pre-declared, available globally):
// - res (resolution): vec2<f32>(width, height);
// - pos (pixel position): vec2<f32>(x, y);
// - time (elapsed since render): f32;
// - mouse (mouse position): vec2<f32>(x, y);
`;

export const texture2dShader = `
@group(0) @binding(1) var frame_sampler: sampler;
@group(0) @binding(2) var previous_frame: texture_2d<f32>;
@group(0) @binding(3) var my_sampler: sampler;
@group(0) @binding(4) var my_texture: texture_2d<f32>;

@vertex
fn vertex_main(vert: VertexInput) -> VertexOutput
{
    var output : VertexOutput;
    output.position = vec4<f32>(vert.position, 0.0, 1.0);
    output.color = vert.color;
    return output;
}

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32>
{
    return textureSample(my_texture, my_sampler, in.color.xy);
}`;

export const structsLength = structs.split(/\r\n|\r|\n/).length + 1;

const structsMessage =
  "To see the predefined uniforms that you have available to you, click the Help button under Code Actions";

export const rectangleVertex = `/*${structsMessage}*/

@vertex
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(vert.position, 0.0, 1.0);
    out.color = vert.color;
    return out;
}`;

export const rectangleFragment = `
@group(0) @binding(1) var frame_sampler: sampler;
@group(0) @binding(2) var previous_frame: texture_2d<f32>;

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
  var out = sin(time * 0.01) * in.color;
  if (pos[0] < res[0]/2.0) {
      out = sin(time * 0.01 + 3.14) * in.color;
  }
  if (length(mouse - pos) < 10.0) {
      out = vec4<f32>(1.0, 1.0, 1.0, 1.0);
  } 
  return out;
}`;

export const cubeVertex = `struct Uniforms {
    mvpMatrix : mat4x4<f32>,
}
@binding(1) @group(0) var<uniform> uniforms : Uniforms;
@vertex
fn vertex_main(@location(0) pos: vec4<f32>, @location(1) color: vec4<f32>) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.mvpMatrix * pos;
    output.color = color;
    return output;
}`;

export const cubeFragment = `@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return in.color;
}`;

export const defaultComputeCode = `// Particle physics compute code adapted from Tarek Sherif on GitHub under the MIT License:
// https://github.com/tsherif/webgpu-examples/blob/gh-pages/particles.html#L283

struct ParticleProperty {
  all: array<vec4<f32>>,
}
struct Mass {
  mass1Position: vec4<f32>,
  mass2Position: vec4<f32>,
  mass3Position: vec4<f32>,
  mass1Factor: f32,
  mass2Factor: f32,
  mass3Factor: f32,
}
struct ViewParams {
    time: f32,
    x: f32,
    y: f32,
    res_x: f32,
    res_y: f32,
}

// Due to definition in the pipeline, these buffers should not be changed beyond renaming them.
@group(0) @binding(0) var<storage, read_write> positionsIn: ParticleProperty;
@group(0) @binding(1) var<storage, read_write> velocityIn: ParticleProperty;
@group(0) @binding(2) var<storage, read_write> positionsOut: ParticleProperty;
@group(0) @binding(3) var<storage, read_write> velocityOut: ParticleProperty;
@group(0) @binding(4) var<uniform> m: Mass;

@group(1) @binding(0) var<uniform> view_params: ViewParams;


@compute @workgroup_size(1)
fn compute_main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
  var index: u32 = GlobalInvocationID.x;

  // These are the same uniforms as available in regular vertex/fragment shaders.
  var res = vec2<f32>(view_params.res_x, view_params.res_y);
  var time = view_params.time;
  var mouse = vec2<f32>(view_params.x, view_params.y);
  
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
}
`;

export const computeGraphicsCode = `@vertex
fn vertex_main(in: VertexInput, @location(2) particlePosition: vec3<f32>) -> VertexOutput {
    var particleSize = 4.0;
    var out: VertexOutput;
    out.position = vec4<f32>(in.position * particleSize / vec2<f32>(view_params.res_x,view_params.res_y) + vec2<f32>(particlePosition[0], particlePosition[1]), particlePosition[2], 1.0);
    out.color = in.color;
    return out;
}

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
    var a = in.color[3];
    return vec4<f32>(in.color[0] * a, in.color[1] * a, in.color[2] * a, in.color[3]);
}`;
