import axios from "axios";
import { rectangleFragment, rectangleVertex } from "../render";
import {
  DocumentData,
  WithFieldValue,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from "@firebase/firestore/lite";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

import { auth, firedb } from "../firebase";

import { firestorage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
export class Shader {
  readonly id: string;
  readonly image: string; //http link to img src
  readonly title: string;
  vertexCode: string | null;
  fragmentCode: string | null;
  isPublic: boolean;

  constructor(
    id: string,
    title: string,
    image: string,
    isPublic: boolean,
    vertexCode: string | null,
    fragmentCode: string | null
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

    // !!! Fix force unwrap
    uploadString(vertexRef, shader.vertexCode!.toString());
    uploadString(fragmentRef, shader.fragmentCode!.toString());

    const shaderDoc = {
      shader_name: shader.title,
      vertex_code: vertexFile,
      fragment_code: fragmentFile,
      isPublic: shader.isPublic,
    };

    return shaderDoc;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Shader {
    const data = snapshot.data();
    if (!data) {
      throw new Error("shader data could not be retrieved from Firebase");
    }
    return new Shader(
      snapshot.id,
      data.shader_name,
      data.image ? data.image : "https://i.ibb.co/M5Z06wy/triangle.png", // image of shader
      data.isPublic,
      null,
      null
    );
  },
};

export const downloadShaderCode = async (id: string): Promise<any> => {
  const user = auth.currentUser;
  let querySnapshot;

  if (user) {
    querySnapshot = await getDoc(doc(firedb, "users", user.uid, "shaders", id));
  }

  let data = querySnapshot?.data();
  if (!data) {
    querySnapshot = await getDoc(doc(firedb, "example-shaders", id));
    data = querySnapshot?.data();
    if (!data) {
      throw new Error("Shader data could not be retrieved from Firebase");
    }
  }

  const vertexCodeURL = await getDownloadURL(
    ref(firestorage, data.vertex_code)
  );
  const fragmentCodeURL = await getDownloadURL(
    ref(firestorage, data.fragment_code)
  );

  const vertexCode = (await axios.get(vertexCodeURL)).data;
  const fragmentCode = (await axios.get(fragmentCodeURL)).data;

  return { vertexCode, fragmentCode };
};

export interface ShaderProps {
  shader: Shader;
}

export const defaultShader = new Shader(
  "",
  "Rectangle",
  "https://i.ibb.co/M5Z06wy/triangle.png",
  false,
  rectangleVertex,
  rectangleFragment
);
