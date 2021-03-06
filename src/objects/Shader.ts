import {
  DocumentData,
  FieldValue,
  QueryDocumentSnapshot,
  WithFieldValue,
  doc,
  getDoc,
} from "@firebase/firestore/lite";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadString,
} from "@firebase/storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { auth, firedb, firestorage } from "../firebase";
import { cubeColourBuffer, cubeVertexBuffer } from "../webgpu/meshes/cube";
import { defaultNumberOfParticles } from "../webgpu/meshes/particles";
import {
  rectangleColourBuffer,
  rectangleNumberOfVertices,
  rectangleVertexBuffer,
} from "../webgpu/meshes/rectangle";
import {
  computeGraphicsCode,
  cubeFragment,
  cubeVertex,
  defaultComputeCode,
  rectangleFragment,
  rectangleVertex,
  texture2dShader,
} from "../webgpu/shaders";

export enum MeshType {
  RECTANGLE = "Rectangle",
  TEXTURED_RECTANGLE = "Textured Rectangle",
  CUBE = "Cube",
  CUSTOM = "Custom",
  PARTICLES = "Particles",
}

export const MeshTypeFromValue = (typeString: string): MeshType => {
  switch (typeString) {
    case "Rectangle":
      return MeshType.RECTANGLE;
    case "Textured Rectangle":
      return MeshType.TEXTURED_RECTANGLE;
    case "Cube":
      return MeshType.CUBE;
    case "Custom":
      return MeshType.CUSTOM;
    case "Particles":
      return MeshType.PARTICLES;
  }
  return MeshType.RECTANGLE;
};

export const StringFromMeshType = (meshType: MeshType | FieldValue) => {
  switch (meshType) {
    case MeshType.RECTANGLE:
      return "Rectangle";
    case MeshType.TEXTURED_RECTANGLE:
      return "Textured Rectangle";
    case MeshType.CUBE:
      return "Cube";
    case MeshType.CUSTOM:
      return "Custom";
    case MeshType.PARTICLES:
      return "Particles";
  }
};

export enum ShaderTypeEnum {
  EXAMPLE = "example",
  PUBLIC = "public",
}

export interface ShaderType {
  pageLink: string;
  sectionName: string;
  type: ShaderTypeEnum;
}

export const ExampleShaderType = {
  pageLink: "/examples",
  sectionName: "Examples",
  type: ShaderTypeEnum.EXAMPLE,
};

export const PublicShaderType = {
  pageLink: "/public",
  sectionName: "Recent Public Shaders",
  type: ShaderTypeEnum.PUBLIC,
};

export const shaderTypeMap = new Map([
  [ShaderTypeEnum.EXAMPLE, ExampleShaderType],
  [ShaderTypeEnum.PUBLIC, PublicShaderType],
]);

export class Shader {
  id: string;
  readonly image: string; //http link to img src
  title: string;
  isPublic: boolean;
  shaderCode: string;
  meshType: MeshType;
  vertexBuffer: string;
  colourBuffer: string;
  numberOfVertices: string;
  numberOfParticles: string;
  imageUrl: string;
  computeCode: string;

  constructor(
    id: string,
    title: string,
    image: string,
    isPublic: boolean,
    shaderCode: string,
    meshType: MeshType,
    vertexBuffer: string = rectangleVertexBuffer,
    colourBuffer: string = rectangleColourBuffer,
    numberOfVertices: string = rectangleNumberOfVertices.toString(),
    numberOfParticles: string = defaultNumberOfParticles.toString(),
    imageUrl = "",
    computeCode: string = defaultComputeCode
  ) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.isPublic = isPublic;
    this.shaderCode = shaderCode;
    this.meshType = meshType;
    this.vertexBuffer = vertexBuffer;
    this.colourBuffer = colourBuffer;
    this.numberOfVertices = numberOfVertices;
    this.numberOfParticles = numberOfParticles;
    this.imageUrl = imageUrl;
    this.computeCode = computeCode;
  }
}

export const shaderConverter = {
  async toFirestore(shader: WithFieldValue<Shader>): Promise<DocumentData> {
    const id = uuidv4();
    const shaderFile = `${id}_${shader.title}.txt`;
    const shaderRef = ref(firestorage, shaderFile);
    const imageFile = `${id}_${shader.title}.png`;
    const imageRef = ref(firestorage, imageFile);
    let computeFile = "";

    const canvas = document.getElementById(
      "canvas-webgpu"
    ) as HTMLCanvasElement;

    const downloadUrl = await new Promise((resolve) =>
      canvas.toBlob(async (blob) => {
        if (blob) {
          await uploadBytes(imageRef, blob);
        }
        resolve(await getDownloadURL(imageRef));
      }, "image/png")
    );

    if (shader.meshType === MeshType.PARTICLES) {
      computeFile = `${id}_${shader.title}_compute.txt`;
      const computeRef = ref(firestorage, computeFile);

      uploadString(computeRef, shader.computeCode.toString());
    }

    uploadString(shaderRef, shader.shaderCode.toString());

    return {
      shader_name: shader.title,
      shader_code: shaderFile,
      image: downloadUrl,
      isPublic: shader.isPublic,
      meshType: StringFromMeshType(shader.meshType),
      vertexBuffer: shader.vertexBuffer,
      colourBuffer: shader.colourBuffer,
      numberOfVertices: shader.numberOfVertices,
      numberOfParticles: shader.numberOfParticles,
      compute_code: computeFile,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Shader {
    const data = snapshot.data();
    if (!data) {
      throw new Error("shader data could not be retrieved from Firebase");
    }
    const mesh_type: MeshType = MeshTypeFromValue(data.meshType);
    return new Shader(
      snapshot.id,
      data.shader_name,
      data.image ? data.image : "https://i.ibb.co/M5Z06wy/triangle.png", // image of shader
      data.isPublic,
      "",
      mesh_type,
      data.vertexBuffer ? data.vertexBuffer : rectangleVertexBuffer,
      data.colourBuffer ? data.colourBuffer : rectangleColourBuffer,
      data.numberOfVertices
        ? data.numberOfVertices
        : rectangleNumberOfVertices.toString(),
      data.numberOfParticles
        ? data.numberOfParticles
        : defaultNumberOfParticles,
      data.imageUrl ? data.imageUrl : "",
      ""
    );
  },
};

interface ShaderCode {
  shaderCode: string;
  computeCode: string;
}

export const downloadShaderCode = async (id: string): Promise<ShaderCode> => {
  const user = auth.currentUser;
  let querySnapshot;

  if (user !== null) {
    querySnapshot = await getDoc(doc(firedb, "users", user.uid, "shaders", id));
  }

  let data = querySnapshot?.data();
  if (!data) {
    querySnapshot = await getDoc(doc(firedb, "example-shaders", id));

    data = querySnapshot?.data();
    if (!data) {
      querySnapshot = await getDoc(doc(firedb, "public-shaders", id));

      data = querySnapshot?.data();
      if (!data) {
        throw new Error("Shader data could not be retrieved from Firebase");
      }
    }
  }

  const shaderCodeURL = await getDownloadURL(
    ref(firestorage, data.shader_code)
  );

  let computeCode = "";
  if (data.compute_code && data.compute_code.length > 0) {
    const computeCodeURL = await getDownloadURL(
      ref(firestorage, data.compute_code)
    );

    computeCode = (await axios.get(computeCodeURL)).data;
  }

  return {
    shaderCode: (await axios.get(shaderCodeURL)).data,
    computeCode: computeCode,
  };
};

export interface ShaderProps {
  shader: Shader;
}

export const defaultRectangleShader = (): Shader => {
  return new Shader(
    uuidv4() + "example_rectangle",
    "Rectangle",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    `${rectangleVertex}\n${rectangleFragment}`,
    MeshType.RECTANGLE
  );
};

export const defaultTexturedRectangleShader = (): Shader => {
  return new Shader(
    uuidv4() + "example_textured_rectangle",
    "Textured Rectangle",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    texture2dShader,
    MeshType.TEXTURED_RECTANGLE
  );
};

export const defaultCubeShader = (): Shader => {
  return new Shader(
    uuidv4() + "example_cube",
    "Cube",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    `${cubeVertex}\n${cubeFragment}`,
    MeshType.CUBE,
    cubeVertexBuffer,
    cubeColourBuffer
  );
};

export const defaultCustomShader = (): Shader => {
  return new Shader(
    uuidv4() + "example_custom_mesh",
    "Custom Mesh",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    `${rectangleVertex}\n${rectangleFragment}`,
    MeshType.CUSTOM
  );
};

export const defaultParticleShader = (): Shader => {
  return new Shader(
    uuidv4() + "example_particles",
    "Particles",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    computeGraphicsCode,
    MeshType.PARTICLES
  );
};

export const defaultShader = (meshType: MeshType): Shader => {
  switch (meshType) {
    case MeshType.RECTANGLE:
      return defaultRectangleShader();
    case MeshType.TEXTURED_RECTANGLE:
      return defaultTexturedRectangleShader();
    case MeshType.CUBE:
      return defaultCubeShader();
    case MeshType.CUSTOM:
      return defaultCustomShader();
    case MeshType.PARTICLES:
      return defaultParticleShader();
    default:
      return defaultRectangleShader();
  }
};
