import axios from "axios";
import { rectangleFragment, rectangleVertex } from "../render";
import {
  DocumentData,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "@firebase/firestore/lite";
import {
  getDownloadURL,
  ref,
  StorageReference,
  uploadString,
} from "@firebase/storage";
import { firestorage } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export class Shader {
  readonly id: string;
  readonly image: string; //http link to img src
  readonly title: string;
  isPublic: boolean;
  shaderCode: string;

  constructor(
    id: string,
    title: string,
    image: string,
    isPublic: boolean,
    shaderCode: string
  ) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.isPublic = isPublic;
    this.shaderCode = shaderCode;
  }
}

export const shaderConverter = {
  toFirestore(shader: WithFieldValue<Shader>): DocumentData {
    const shaderFile = `${uuidv4()}_${shader.title}.txt`;
    const shaderRef = ref(firestorage, shaderFile);

    uploadString(shaderRef, shader.shaderCode.toString());

    return {
      shader_name: shader.title,
      shader_code: shaderFile,
      isPublic: shader.isPublic,
    };
  },
  async fromFirestore(snapshot: QueryDocumentSnapshot): Promise<Shader | void> {
    if (!snapshot.data()) {
      return;
    }
    const data = snapshot.data();
    if (!data) {
      throw new Error("shader data could not be retrieved from Firebase");
    }

    try {
      const shaderCode = await downloadStorageRef(
        ref(firestorage, data.shader_code)
      );

      return new Shader(
        snapshot.id,
        data.shader_name,
        "", // image of shader
        data.isPublic,
        shaderCode
      );
    } catch (err) {
      if (err instanceof Error) {
        console.log("ERROR: " + err.message);
      }
      return;
    }
  },
};

const downloadStorageRef = async (ref: StorageReference): Promise<string> => {
  const url = await getDownloadURL(ref);
  return (await axios.get(url)).data;
};

export interface ShaderProps {
  shader: Shader;
}

export const defaultShader = new Shader(
  uuidv4() + "example_rectangle_shader",
  "Triangle",
  "https://i.ibb.co/M5Z06wy/triangle.png",
  false,
  `${rectangleVertex}\n${rectangleFragment}`
);
