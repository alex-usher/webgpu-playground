import {
  collection,
  getDocs,
  CollectionReference,
  DocumentData,
} from "@firebase/firestore/lite";
import { auth, firedb } from "../firebase";
import { shaderConverter, NonFetchedShader } from "../objects/Shader";

const getShaders = async (
  collection: CollectionReference<DocumentData>
): Promise<NonFetchedShader[]> => {
  const querySnapshot = await getDocs(collection);
  const shaders: NonFetchedShader[] = [];
  for (const doc of querySnapshot.docs) {
    const shader = await shaderConverter.fromFirestore(doc);
    if (shader) {
      shaders.push(shader);
    }
  }
  return shaders;
};

export const getExampleShaders = async (): Promise<NonFetchedShader[]> => {
  return await getShaders(collection(firedb, "example-shaders"));
};

export const getPublicShaders = async (): Promise<NonFetchedShader[]> => {
  return await getShaders(collection(firedb, "public-shaders"));
};

export const getUserShaders = async (): Promise<NonFetchedShader[]> => {
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

export const getUserPublicShaders = async (): Promise<NonFetchedShader[]> => {
  const publicShaders: NonFetchedShader[] = [];
  const shaders: NonFetchedShader[] = await getUserShaders();
  for (const shader of shaders) {
    if (shader.isPublic) {
      publicShaders.push(shader);
    }
  }
  return publicShaders;
};

export const getUserPrivateShaders = async (): Promise<NonFetchedShader[]> => {
  const privateShaders: NonFetchedShader[] = [];
  const shaders: NonFetchedShader[] = await getUserShaders();
  for (const shader of shaders) {
    if (!shader.isPublic) {
      privateShaders.push(shader);
    }
  }
  return privateShaders;
};
