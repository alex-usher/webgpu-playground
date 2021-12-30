import { MeshType, Shader } from "../../objects/Shader";
import { shaderTriangleVertex } from "./triangle";

export const defaultShader = new Shader(
  "testid",
  "testfile",
  "testimage",
  false,
  shaderTriangleVertex,
  MeshType.RECTANGLE,
  "",
  "",
  "6",
  "2000",
  "testimageurl.com/image"
);
