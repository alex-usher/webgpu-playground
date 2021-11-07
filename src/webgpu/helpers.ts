import { vec3, mat4 } from "gl-matrix";

export const checkWebGPU = (): boolean => navigator.gpu != null;

export const outputMessages = async (shaderModule: GPUShaderModule) => {
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

export const CreateGPUBuffer = (
  device: GPUDevice,
  data: Float32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX |
    GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export const CreateTransforms = (
  modelMat: mat4,
  translation: vec3 = [0, 0, 0],
  rotation: vec3 = [0, 0, 0],
  scaling: vec3 = [1, 1, 1]
) => {
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

export const CreateViewProjection = (
  respectRatio = 1.0,
  cameraPosition: vec3 = [2, 2, 4],
  lookDirection: vec3 = [0, 0, 0],
  upDirection: vec3 = [0, 1, 0]
) => {
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
