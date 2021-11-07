import {
  collection,
  getDocs,
  CollectionReference,
  DocumentData,
  doc,
  runTransaction,
} from "@firebase/firestore/lite";
import { auth, firedb } from "../firebase";
import { shaderConverter, Shader } from "../objects/Shader";
import { useSnackbar } from "notistack";

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

class unsavedErr extends Error {
  constructor() {
    super();
  }
}

class loggedOutErr extends Error {
  constructor() {
    super();
  }
}

// functions to edit public/private status of shaders
const toggleShaderPublicity = async (
  shader: Shader,
  makePublic: boolean
): Promise<boolean> => {
  const success = false;
  const publicity = makePublic ? "public" : "private";
  const publicitied = makePublic ? "published" : "privated";
  const { enqueueSnackbar } = useSnackbar();
  try {
    const user = auth.currentUser;
    if (user) {
      // use transactions to ensure public=public and private=private
      // and deal with unsaved error case
      await runTransaction(firedb, async (transaction) => {
        const shaderDoc = await transaction.get(
          doc(firedb, "users", user.uid, "shaders", shader.id)
        );
        if (!shaderDoc.exists()) {
          throw new unsavedErr();
        }

        if (makePublic) {
          transaction.update(
            doc(firedb, "users", user.uid, "shaders", shader.id),
            { isPublic: true }
          );
          transaction.set(doc(firedb, "public-shaders", shader.id), shaderDoc);
        } else {
          transaction.update(
            doc(firedb, "users", user.uid, "shaders", shader.id),
            { isPublic: false }
          );
          transaction.delete(doc(firedb, "public-shaders", shader.id));
        }
      });
    } else {
      // user is not logged in. this could be the case if
      // a guest tries to use toggle on a public/example shader.
      // ideally should not be possible.
      throw new loggedOutErr();
    }
  } catch (err) {
    if (success) {
      enqueueSnackbar("Successfully " + publicitied + shader.title + "!", {
        variant: "success",
        autoHideDuration: 1000,
      });
    } else {
      if (err instanceof unsavedErr) {
        enqueueSnackbar(
          "Failed to publish shader - save your shader to make it " +
            publicity +
            "!",
          {
            variant: "error",
            autoHideDuration: 1000,
          }
        );
      } else if (err instanceof loggedOutErr) {
        enqueueSnackbar(
          "Failed to publish shader - log in to make your shaders " +
            publicity +
            "!",
          {
            variant: "error",
            autoHideDuration: 1000,
          }
        );
      }
    }
  }

  // a false result means that the toggle should not move! the operation has not been successful
  return success;
};

export const makeShaderPublic = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, true);
};

export const makeShaderPrivate = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, true);
};
