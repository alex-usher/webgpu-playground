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
  // title: title of shader
  // image: image src (http link)
  // vertexCode: ideally a string
  // fragmentCode: ideally a string
  // isPublic: boolean
  readonly image: string;
  fragmentCode: string;
  readonly title: string;
  vertexCode: string;
  isPublic: boolean;

  constructor(
    title: string,
    image: string,
    isPublic: boolean,
    vertexCode: string,
    fragmentCode: string
  ) {
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
    console.log(shader.fragmentCode.toString());
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

    const data = snapshot.data()!;

    try {
      const vertexCode = await downloadStorageRef(
        ref(firestorage, data.vertex_code)
      );
      const fragmentCode = await downloadStorageRef(
        ref(firestorage, data.fragment_code)
      );

      const shader = new Shader(
        data.shader_name,
        "", // image of shader
        data.isPublic ? true : false,
        vertexCode,
        fragmentCode
      );
      return shader;
    } catch (err) {
      console.log("ERROR: " + err);
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
  "Triangle",
  "https://i.ibb.co/M5Z06wy/triangle.png",
  false,
  rectangleVertex,
  rectangleFragment
);
