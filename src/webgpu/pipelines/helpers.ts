import { mat4, vec3 } from "gl-matrix";

import { RenderLogger } from "../../objects/RenderLogger";
import { structsLength } from "../shaders";

export const checkWebGPU = (): boolean => navigator.gpu != null;

const globalVars =
  "\nvar<private> res: vec2<f32>;\n" +
  "var<private> pos: vec2<f32>;\n" +
  "var<private> time: f32;\n" +
  "var<private> mouse: vec2<f32>;\n";
const uniformVars =
  "\nres = vec2<f32>(view_params.res_x, view_params.res_y);\n" +
  "pos = vec2<f32>(in.position[0], in.position[1]);\n" +
  "time = view_params.time;\n" +
  "mouse = vec2<f32>(view_params.x, view_params.y);\n";

let codeBeforeFragment = "";
let titleOfFragment = "";
let codeAfterFragment = "";

export const addUniformCode = (shaderCode: string): string => {
  const splitOnFragmentDecl = shaderCode.split("@fragment");
  codeBeforeFragment = splitOnFragmentDecl[0];
  let splitInFragmentDecl = [""];
  if (splitOnFragmentDecl.length > 1) {
    splitInFragmentDecl = splitOnFragmentDecl[1].split(RegExp(/{([\s\S]*)/), 2);
  }
  titleOfFragment = splitInFragmentDecl[0];
  if (splitInFragmentDecl.length > 1) {
    codeAfterFragment = splitInFragmentDecl[1];
  }

  return (
    globalVars +
    codeBeforeFragment +
    "@fragment" +
    titleOfFragment +
    "{" +
    uniformVars +
    codeAfterFragment
  );
};

const getTextLines = (text: string) => {
  return text.split(/\r\n|\r|\n/).length - 1;
};

export const outputMessages = async (
  shaderModule: GPUShaderModule,
  renderLogger: RenderLogger
) => {
  if (shaderModule.compilationInfo) {
    const messages = (await shaderModule.compilationInfo()).messages;
    const uniformLines = getTextLines(uniformVars);
    const isCompute = renderLogger.isMarkedCompute();

    let limitBeforeUniforms = -1;
    if (!isCompute) {
      limitBeforeUniforms =
        getTextLines(globalVars) +
        getTextLines(codeBeforeFragment) +
        getTextLines(titleOfFragment) +
        structsLength;
    }

    if (messages.length > 0) {
      let error = false;
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        let extraLines = structsLength + getTextLines(globalVars) - 1;
        if (
          message.lineNum > limitBeforeUniforms + uniformLines &&
          !isCompute
        ) {
          extraLines += uniformLines;
        }

        let messageWithDetails = "";
        if (isCompute) {
          messageWithDetails = `Compute error (${message.lineNum}, ${message.linePos}): ${message.message}`;
        } else {
          messageWithDetails = `Shader error (${
            message.lineNum - extraLines
          }, ${message.linePos}): ${message.message}`;
        }
        renderLogger.logMessage(messageWithDetails, "error");
        error = error || message.type === "error";
      }

      return !error;
    }

    return true;
  }

  return false;
};

export const createGPUBuffer = (
  device: GPUDevice,
  data: Float32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX |
    GPUBufferUsage.COPY_DST
): GPUBuffer => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export const createTransforms = (
  modelMat: mat4,
  translation: vec3 = [0, 0, 0],
  rotation: vec3 = [0, 0, 0],
  scaling: vec3 = [1, 1, 1]
): void => {
  const rotateXMat = mat4.create();
  const rotateYMat = mat4.create();
  const rotateZMat = mat4.create();
  const translateMat = mat4.create();
  const scaleMat = mat4.create();

  //perform individual transformations
  mat4.fromTranslation(translateMat, translation);
  mat4.fromXRotation(rotateXMat, rotation[0]);
  mat4.fromYRotation(rotateYMat, rotation[1]);
  mat4.fromZRotation(rotateZMat, rotation[2]);
  mat4.fromScaling(scaleMat, scaling);

  //combine all transformation matrices together to form a final transform matrix: modelMat
  mat4.multiply(modelMat, rotateXMat, scaleMat);
  mat4.multiply(modelMat, rotateYMat, modelMat);
  mat4.multiply(modelMat, rotateZMat, modelMat);
  mat4.multiply(modelMat, translateMat, modelMat);
};

export const createViewProjection = (
  respectRatio = 1.0,
  cameraPosition: vec3 = [2, 2, 4],
  lookDirection: vec3 = [0, 0, 0],
  upDirection: vec3 = [0, 1, 0]
): {
  viewMatrix: mat4;
  projectionMatrix: mat4;
  viewProjectionMatrix: mat4;
  cameraOption: { eye: vec3; center: vec3; zoomMax: number; zoomSpeed: number };
} => {
  const viewMatrix = mat4.create();
  const projectionMatrix = mat4.create();
  const viewProjectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    (2 * Math.PI) / 5,
    respectRatio,
    0.1,
    100.0
  );

  mat4.lookAt(viewMatrix, cameraPosition, lookDirection, upDirection);
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  const cameraOption = {
    eye: cameraPosition,
    center: lookDirection,
    zoomMax: 100,
    zoomSpeed: 2,
  };

  return {
    viewMatrix,
    projectionMatrix,
    viewProjectionMatrix,
    cameraOption,
  };
};

export const addViewParamsToBuffer = async (
  device: GPUDevice,
  commandEncoder: GPUCommandEncoder,
  viewParamsBuffer: GPUBuffer,
  time: number,
  x: number,
  y: number,
  res_x: number,
  res_y: number
): Promise<void> => {
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

  commandEncoder.copyBufferToBuffer(timeBuffer, 0, viewParamsBuffer, 0, 4);
  commandEncoder.copyBufferToBuffer(xBuffer, 0, viewParamsBuffer, 4, 4);
  commandEncoder.copyBufferToBuffer(yBuffer, 0, viewParamsBuffer, 8, 4);
  commandEncoder.copyBufferToBuffer(resXBuffer, 0, viewParamsBuffer, 12, 4);
  commandEncoder.copyBufferToBuffer(resYBuffer, 0, viewParamsBuffer, 16, 4);
};
