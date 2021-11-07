import {
  collection,
  getDocs,
  CollectionReference,
  DocumentData,
} from "@firebase/firestore/lite";
import { auth, firedb } from "../firebase";
import { shaderConverter, Shader } from "../objects/Shader";

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
