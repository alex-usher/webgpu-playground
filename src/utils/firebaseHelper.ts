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

const getExampleShaders = async (): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "example-shaders"));
};

const getPublicShaders = async (): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "public-shaders"));
};

const getUserShaders = async (isPublic: boolean): Promise<Shader[]> => {
  const user = auth.currentUser;
  if (user) {
    const querySnapshot = await getDocs(
      collection(firedb, "users", user.uid, "shaders")
    );
    const shaders: Shader[] = [];
    for (const doc of querySnapshot.docs) {
      const shader = await shaderConverter.fromFirestore(doc);
      if (shader && shader.isPublic == isPublic) {
        shaders.push(shader);
      }
    }
    console.log(shaders);
    return shaders;
  } else {
    // error - user not signed in
    console.log("user not signed in >:^(");
  }
  return [];
};

const getUserPublicShaders = async (): Promise<Shader[]> => {
  return getUserShaders(true);
};

const getUserPrivateShaders = async (): Promise<Shader[]> => {
  return getUserShaders(false);
};

export {
  getExampleShaders,
  getPublicShaders,
  getUserPublicShaders,
  getUserPrivateShaders,
};
