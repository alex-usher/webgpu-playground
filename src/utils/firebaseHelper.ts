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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserPublicShaders = (_uid: any): Shader[] => {
  return defaultReturn;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserPrivateShaders = (_uid: any): Shader[] => {
  return defaultReturn;
};
