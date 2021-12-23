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
import {
  rectangleColourBuffer,
  rectangleNumberOfVertices,
  rectangleVertexBuffer,
} from "../webgpu/meshes/rectangle";
import {
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

// TODO - find a neater way of handling parsing strings to enums
// might be possible with the below
// type MeshTypeStrings = keyof typeof MeshType;
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

//export type ShaderType = ExampleShaderType || PublicShaderType

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
      imageUrl: shader.imageUrl,
      compute_code: shader.computeCode,
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
      data.imageUrl ? data.imageUrl : "",
      data.computeCode ? data.computeCode : defaultComputeCode
    );
  },
};

export const downloadShaderCode = async (id: string): Promise<string> => {
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

  return (await axios.get(shaderCodeURL)).data;
};

export interface ShaderProps {
  shader: Shader;
}

export const defaultShader = (meshType: MeshType): Shader => {
  // set shader to a default rectangle
  let shader = new Shader(
    uuidv4() + "example_rectangle",
    "Rectangle",
    "https://i.ibb.co/M5Z06wy/triangle.png",
    false,
    `${rectangleVertex}\n${rectangleFragment}`,
    MeshType.RECTANGLE
  );

  if (meshType === MeshType.TEXTURED_RECTANGLE) {
    shader.shaderCode = texture2dShader;
    shader.id = uuidv4() + "example_textured_rectangle";
    shader.title = "Textured Rectangle";
    shader.meshType = MeshType.TEXTURED_RECTANGLE;
    shader.imageUrl = shader.image;
  } else if (meshType === MeshType.CUBE) {
    // TODO change to return a default cube shader
    shader = new Shader(
      uuidv4() + "example_cube_shader",
      "Cube",
      "https://i.ibb.co/M5Z06wy/triangle.png",
      false,
      `${cubeVertex}\n${cubeFragment}`,
      MeshType.CUBE,
      cubeVertexBuffer,
      cubeColourBuffer
    );
  } else if (meshType === MeshType.CUSTOM) {
    shader.id = uuidv4() + "custom_mesh";
    shader.title = "Custom Mesh";
    shader.meshType = MeshType.CUSTOM;
  } else if (meshType === MeshType.PARTICLES) {
    shader.id = uuidv4() + "particles";
    shader.title = "Particles";
    shader.meshType = MeshType.PARTICLES;
    // might need to add defaults for compute code???
  }
  return shader;
};
