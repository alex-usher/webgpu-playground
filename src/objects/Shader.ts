import axios from "axios";
import { rectangleFragment, rectangleVertex } from "../webgpu/shaders";
import {
  doc,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "@firebase/firestore/lite";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadString,
} from "@firebase/storage";
import { auth, firedb, firestorage } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export class Shader {
  id: string;
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
    };
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
      ""
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

export const defaultShader = new Shader(
  uuidv4() + "example_rectangle_shader",
  "Triangle",
  "https://i.ibb.co/M5Z06wy/triangle.png",
  false,
  `${rectangleVertex}\n${rectangleFragment}`
);
