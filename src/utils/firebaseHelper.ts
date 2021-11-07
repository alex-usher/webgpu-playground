import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  getDocs,
} from "@firebase/firestore/lite";
import { auth, firedb } from "../firebase";
import {
  defaultShader,
  downloadShaderCode,
  Shader,
  shaderConverter,
} from "../objects/Shader";

const getShaders = async (
  collection: CollectionReference<DocumentData>
): Promise<Shader[]> => {
  const querySnapshot = await getDocs(collection);
  const shaders: Shader[] = [];
  for (const doc of querySnapshot.docs) {
    const shader = await shaderConverter.fromFirestore(doc);
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
    console.log("ERROR: user is not logged in");
  }
  return [];
};

export const getUserPublicShaders = async (): Promise<Shader[]> => {
  const publicShaders: Shader[] = [];
  const shaders: Shader[] = await getUserShaders();
  for (const shader of shaders) {
    if (shader.isPublic) {
      publicShaders.push(shader);
    }
  }
  return publicShaders;
};

export const getUserPrivateShaders = async (): Promise<Shader[]> => {
  const privateShaders: Shader[] = [];
  const shaders: Shader[] = await getUserShaders();
  for (const shader of shaders) {
    if (!shader.isPublic) {
      privateShaders.push(shader);
    }
  }
  return privateShaders;
};

// eslint-disable-next-line
export const getShaderCode = async (shader: any): Promise<Shader> => {
  shader.shaderCode = await downloadShaderCode(shader.shader.id);
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
      querySnapshot = await getDoc(
        doc(firedb, "public-shaders", id).withConverter(shaderConverter)
      );

      data = querySnapshot?.data();
      if (!data) {
        throw new Error("Shader data could not be retrieved from Firebase");
      }
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

    if (shader === undefined) {
      throw new Error();
    }

    return shader;
  } catch (err) {
    throw new Error("Shader data could not be retrieved from Firebase");
  }
};

export const uploadExample = async (): Promise<void> => {
  const data = shaderConverter.toFirestore(defaultShader);
  const shader = await addDoc(collection(firedb, "example-shaders"), data);
  console.log(shader);
};
