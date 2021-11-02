import { defaultShader, Shader } from "../objects/Shader";

const defaultReturn = [
  defaultShader,
  defaultShader,
  defaultShader,
  defaultShader,
  defaultShader,
  defaultShader,
  defaultShader,
];

export const getPublicShaders = (): Shader[] => {
  return defaultReturn;
};

export const getUserPublicShaders = (): Shader[] => {
  return defaultReturn;
};

export const getUserPrivateShaders = (): Shader[] => {
  return defaultReturn;
};
