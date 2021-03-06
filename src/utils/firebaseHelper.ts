import { getAuth } from "@firebase/auth";
import {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
} from "@firebase/firestore/lite";
import { setDoc } from "@firebase/firestore/lite";
import { deleteObject, ref } from "@firebase/storage";

import { auth, firedb, firestorage } from "../firebase";
import {
  MeshType,
  Shader,
  ShaderTypeEnum,
  defaultShader,
  downloadShaderCode,
  shaderConverter,
} from "../objects/Shader";
import SnackbarUtils from "./Snackbar";

export const fetchPaginatedShaders = async (
  shaderTypeEnum: ShaderTypeEnum,
  pageLength: number,
  latestDoc: DocumentSnapshot | undefined,
  setLatestDoc: (newDoc: DocumentSnapshot) => void
): Promise<Shader[]> => {
  const shaders = [];
  const collect =
    shaderTypeEnum == ShaderTypeEnum.PUBLIC
      ? collection(firedb, "public-shaders")
      : collection(firedb, "example-shaders");
  const querySnapshot = await getDocs(
    query(
      collect,
      orderBy("shader_code"),
      startAfter(latestDoc || 0),
      limit(pageLength)
    )
  );
  setLatestDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
  for (const doc of querySnapshot.docs) {
    const shader = await shaderConverter.fromFirestore(doc);
    if (shader) {
      shaders.push(shader);
    }
  }

  return shaders;
};

const getShaders = async (
  collection: CollectionReference<DocumentData>,
  pageLength?: number
): Promise<Shader[]> => {
  const shaders: Shader[] = [];

  let querySnapshot;

  if (pageLength) {
    querySnapshot = await getDocs(query(collection, limit(pageLength)));
  } else {
    querySnapshot = await getDocs(collection);
  }
  for (const doc of querySnapshot.docs) {
    const shader = shaderConverter.fromFirestore(doc);
    if (shader) {
      shaders.push(shader);
    }
  }
  return shaders;
};

export const getExampleShaders = async (
  pageLength?: number
): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "example-shaders"), pageLength);
};

export const getPublicShaders = async (
  pageLength?: number
): Promise<Shader[]> => {
  return await getShaders(collection(firedb, "public-shaders"), pageLength);
};

export const getUserShaders = async (
  pageLength?: number
): Promise<Shader[]> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await getShaders(
      collection(firedb, "users", user.uid, "shaders"),
      pageLength
    );
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

export const getShaderCode = async (shader: Shader): Promise<Shader> => {
  const code = await downloadShaderCode(shader.id);
  shader.shaderCode = code.shaderCode;
  shader.computeCode = code.computeCode;

  return shader;
};

export const isCurrentUsersShader = async (
  shader: Shader
): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (user) {
      const data = (
        await getDoc(
          doc(firedb, "users", user.uid, "shaders", shader.id).withConverter(
            shaderConverter
          )
        )
      )?.data();
      return data ? true : false;
    }
    SnackbarUtils.error("You must be logged in to save a shader.");
    return false;
  } catch {
    return false;
  }
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

export const getShaderDataById = async (id: string): Promise<DocumentData> => {
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
      querySnapshot = await getDoc(doc(firedb, "public-shaders", id));

      data = querySnapshot?.data();
      if (!data) {
        throw new Error("Shader data could not be retrieved from Firebase");
      }
    }
  }
  return data;
};

class nameErr extends Error {
  dupedName: string;
  constructor(dupedName: string) {
    super();
    this.dupedName = dupedName;
  }
}

export const deleteShader = async (shader: Shader): Promise<boolean> => {
  // delete shader
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new loggedOutErr();
    }

    if (shader.id === "") {
      throw new Error("Cannot delete an unsaved shader.");
    }

    await deleteFiles(shader);
    await deleteDoc(doc(firedb, "users", user.uid, "shaders", shader.id));
    await deleteDoc(doc(firedb, "public-shaders", shader.id));
    return true;
  } catch (err) {
    if (err instanceof loggedOutErr) {
      SnackbarUtils.error("You must be logged in to delete a shader.");
    } else {
      SnackbarUtils.error("Error deleting shader.");
    }
    return false;
  }
};

const deleteFiles = async (shader: Shader) => {
  const shaderData = await getShaderDataById(shader.id);
  await deleteCodeFile(shaderData);
  await deleteImageFile(shaderData);
};

const deleteCodeFile = async (shaderData: DocumentData) => {
  const shaderRef = ref(firestorage, shaderData.shader_code);
  await deleteObject(shaderRef);

  if (shaderData.compute_code && shaderData.compute_code.length > 0) {
    const computeRef = ref(firestorage, shaderData.compute_code);
    await deleteObject(computeRef);
  }
};

const deleteImageFile = async (shaderData: DocumentData) => {
  const imageRef = ref(firestorage, shaderData.image);
  await deleteObject(imageRef);
};

export const overwriteShader = async (shader: Shader) => {
  try {
    await deleteFiles(shader);
    const shaderDoc = await shaderConverter.toFirestore(shader);

    const user = auth.currentUser;
    if (user) {
      await setDoc(
        doc(firedb, "users", user.uid, "shaders", shader.id),
        shaderDoc
      );
      if (shader.isPublic) {
        await setDoc(doc(firedb, "public-shaders", shader.id), shaderDoc);
      }
    }
    SnackbarUtils.success("Successfully saved!");
    return shader;
  } catch {
    SnackbarUtils.error("Failed to save.");
  }
};

export const saveNewShader = async (
  shader: Shader
): Promise<Shader | undefined> => {
  try {
    const user = auth.currentUser;
    if (user) {
      const existingShaders = await getUserShaders();
      for (const existingShader of existingShaders) {
        if (shader.title == existingShader.title) {
          throw new nameErr(shader.title);
        }
      }
    }

    const shaderDoc = await shaderConverter.toFirestore(shader);

    if (shader.isPublic) {
      shader.id = (
        await addDoc(collection(firedb, "public-shaders"), shaderDoc)
      ).id;
    }

    if (user) {
      if (shader.id !== "") {
        await setDoc(
          doc(firedb, "users", user.uid, "shaders", shader.id),
          shaderDoc
        );
      } else {
        const usersShadersRef = collection(
          firedb,
          "users",
          user.uid,
          "shaders"
        );
        shader.id = (await addDoc(usersShadersRef, shaderDoc)).id;
      }
    }
    SnackbarUtils.success("Successfully saved!");
    return shader;
  } catch (err) {
    if (err instanceof nameErr) {
      SnackbarUtils.error(
        'A shader with name "' + err.dupedName + '" already exists!'
      );
    } else {
      SnackbarUtils.error("Failed to save!");
    }
  }
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
  let success = false;
  const publicity = makePublic ? "public" : "private";
  const publicitied = makePublic ? "published " : "privated ";
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
          const publicShaderDocData = shaderDoc.data();
          publicShaderDocData.isPublic = true;
          transaction.set(
            doc(firedb, "public-shaders", shader.id),
            publicShaderDocData
          );
        } else {
          transaction.update(
            doc(firedb, "users", user.uid, "shaders", shader.id),
            { isPublic: false }
          );
          transaction.delete(doc(firedb, "public-shaders", shader.id));
        }
      });
      success = true;
    } else {
      // user is not logged in.
      // should not be possible.
      throw new loggedOutErr();
    }
  } catch (err) {
    SnackbarUtils.error(
      "Failed to make shader " + publicity + "! Please Try again."
    );
  }
  if (success) {
    SnackbarUtils.success("Successfully " + publicitied + shader.title + "!");
  }
  // a false result means that the toggle should not move! the operation has not been successful
  return success;
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
  const data = await shaderConverter.toFirestore(
    defaultShader(MeshType.RECTANGLE)
  );
  await addDoc(collection(firedb, "example-shaders"), data);
};

export const makeShaderPublic = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, true);
};

export const makeShaderPrivate = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, false);
};
