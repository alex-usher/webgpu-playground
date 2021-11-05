import axios from "axios";
import { rectangleFragment, rectangleVertex } from "../render";
import {
  DocumentData,
  WithFieldValue,
  QueryDocumentSnapshot,
} from "@firebase/firestore/lite";
import {
  ref,
  uploadString,
  getDownloadURL,
  StorageReference,
} from "@firebase/storage";
import { firestorage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
export class Shader {
  readonly id: string;
  readonly image: string; //http link to img src
  fragmentCode: string;
  readonly title: string;
  vertexCode: string;
  isPublic: boolean;

  constructor(
    id: string,
    title: string,
    image: string,
    isPublic: boolean,
    vertexCode: string,
    fragmentCode: string
  ) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.isPublic = isPublic;
    this.vertexCode = vertexCode;
    this.fragmentCode = fragmentCode;
  }
}

export const shaderConverter = {
  toFirestore(shader: WithFieldValue<Shader>): DocumentData {
    const vertexFile = uuidv4() + "_" + shader.title + "_vertex.txt";
    const fragmentFile = uuidv4() + "_" + shader.title + "_fragment.txt";

    const vertexRef = ref(firestorage, vertexFile);
    const fragmentRef = ref(firestorage, fragmentFile);

    uploadString(vertexRef, shader.vertexCode.toString());
    uploadString(fragmentRef, shader.fragmentCode.toString());

    const shaderDoc = {
      shader_name: shader.title,
      vertex_code: vertexFile,
      fragment_code: fragmentFile,
      isPublic: shader.isPublic,
    };

    return shaderDoc;
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
      const vertexCode = await downloadStorageRef(
        ref(firestorage, data.vertex_code)
      );
      const fragmentCode = await downloadStorageRef(
        ref(firestorage, data.fragment_code)
      );

      const shader = new Shader(
        snapshot.id,
        data.shader_name,
        "", // image of shader
        data.isPublic,
        vertexCode,
        fragmentCode
      );
      return shader;
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
  rectangleVertex,
  rectangleFragment
);
