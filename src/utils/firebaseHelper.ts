import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  CollectionReference,
  DocumentData,
  doc,
} from "@firebase/firestore/lite";
import { auth, firedb } from "../firebase";
import {
  shaderConverter,
  Shader,
  downloadShaderCode,
  defaultShader,
} from "../objects/Shader";

const getShaders = async (
  collection: CollectionReference<DocumentData>
): Promise<Shader[]> => {
  const querySnapshot = await getDocs(collection);
  const shaders: Shader[] = [];
  for (const doc of querySnapshot.docs) {
    const shader = shaderConverter.fromFirestore(doc);
    if (shader) {
      shaders.push(shader);
    }
  }
  return shaders;
};

export const getExampleShaders = async (): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "example-shaders"));
};

export const getPublicShaders = async (): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "public-shaders"));
};

export const getUserShaders = async (): Promise<Shader[]> => {
  const user = auth.currentUser;
  if (user) {
    return await getShaders(collection(firedb, "users", user.uid, "shaders"));
  } else {
    // user is not logged in. this should never be a problem, as getUserShaders should
    // never be invoked without the user being logged in.
    throw new Error("User is not logged in.");
  }
  return [];
};

export const getUserPublicShaders = async (): Promise<Shader[]> => {
  const publicShaders: Shader[] = [];
  const shaders: Shader[] = await getUserShaders();
  for (const shader of shaders) {
    if (shader.isPublic == true) {
      publicShaders.push(shader);
    }
  }
  return publicShaders;
};

export const getUserPrivateShaders = async (): Promise<Shader[]> => {
  const privateShaders: Shader[] = [];
  const shaders: Shader[] = await getUserShaders();
  for (const shader of shaders) {
    if (shader.isPublic == false) {
      privateShaders.push(shader);
    }
  }
  return privateShaders;
};

export const getShaderCode = async (shader: Shader): Promise<Shader> => {
  const { vertexCode, fragmentCode } = await downloadShaderCode(shader.id);
  shader.vertexCode = vertexCode;
  shader.fragmentCode = fragmentCode;
  return shader;
};

export const getShaderById = async (id: string): Promise<Shader> => {
  const user = auth.currentUser;
  let querySnapshot;

  if (user) {
    querySnapshot = await getDoc(
      doc(firedb, "users", user.uid, "shaders", id).withConverter(
        shaderConverter
      )
    );
  }

  let data = querySnapshot?.data();
  if (!data) {
    querySnapshot = await getDoc(
      doc(firedb, "example-shaders", id).withConverter(shaderConverter)
    );
    data = querySnapshot?.data();
    if (!data) {
      throw new Error("Shader data could not be retrieved from Firebase");
    }
  }

  return data;
};

export const getDefaultShader = async (): Promise<Shader> => {
  try {
    const shader = (
      await getDoc(
        doc(firedb, "example-shaders", "8ssqqpVWyfXYdQphsbnP").withConverter(
          shaderConverter
        )
      )
    ).data();
    return shader!;
  } catch (err) {
    throw new Error("Shader data could not be retrieved from Firebase");
  }
};

export const uploadExample = async (): Promise<void> => {
  const data = shaderConverter.toFirestore(defaultShader);
  const shader = await addDoc(collection(firedb, "example-shaders"), data);
  console.log(shader);
};
