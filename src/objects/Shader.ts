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

abstract class Shader {
  readonly image: string; //http link to img src
  readonly title: string;
  isPublic: boolean;

  constructor(title: string, image: string, isPublic: boolean) {
    this.title = title;
    this.image = image;
    this.isPublic = isPublic;
  }
}

export class NonFetchedShader extends Shader {
  fragmentCodeRef: StorageReference;
  vertexCodeRef: StorageReference;

  constructor(
    title: string,
    image: string,
    isPublic: boolean,
    vertexCodeRef: StorageReference,
    fragmentCodeRef: StorageReference
  ) {
    super(title, image, isPublic);
    this.vertexCodeRef = vertexCodeRef;
    this.fragmentCodeRef = fragmentCodeRef;
  }

  public async doFetchCode(): Promise<FetchedShader> {
    const fragmentCode = await downloadStorageRef(this.fragmentCodeRef);
    const vertexCode = await downloadStorageRef(this.vertexCodeRef);

    return new FetchedShader(
      this.title,
      this.image,
      this.isPublic,
      vertexCode,
      fragmentCode
    );
  }
}

export class FetchedShader extends Shader {
  fragmentCode: string;
  vertexCode: string;

  constructor(
    title: string,
    image: string,
    isPublic: boolean,
    vertexCode: string,
    fragmentCode: string
  ) {
    super(title, image, isPublic);
    this.vertexCode = vertexCode;
    this.fragmentCode = fragmentCode;
  }
}

export const shaderConverter = {
  toFirestore(shader: WithFieldValue<FetchedShader>): DocumentData {
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
  async fromFirestore(
    snapshot: QueryDocumentSnapshot
  ): Promise<NonFetchedShader | void> {
    if (!snapshot.data()) {
      return;
    }
    const data = snapshot.data();
    if (!data) {
      throw new Error("shader data could not be retrieved from Firebase");
    }

    try {
      const vertexCodeRef = ref(firestorage, data.vertex_code);
      const fragmentCodeRef = ref(firestorage, data.fragment_code);

      return new NonFetchedShader(
        data.shader_name,
        "", // image of shader
        data.isPublic,
        vertexCodeRef,
        fragmentCodeRef
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

export interface NonFetchedShaderProps {
  shader: NonFetchedShader;
}

export interface FetchedShaderProps {
  shader: FetchedShader;
}

export const defaultShader = new FetchedShader(
  "Triangle",
  "https://i.ibb.co/M5Z06wy/triangle.png",
  false,
  rectangleVertex,
  rectangleFragment
);
