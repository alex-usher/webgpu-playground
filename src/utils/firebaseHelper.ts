import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
} from "@firebase/firestore/lite";
import {
  defaultShader,
  downloadShaderCode,
  Shader,
  shaderConverter,
  ShaderTypeEnum,
} from "../objects/Shader";
import { auth, firedb } from "../firebase";
import { useSnackbar } from "notistack";

export const fetchPaginatedShaders = async (
  shaderTypeEnum: ShaderTypeEnum,
  pageLength: number,
  latestDoc: DocumentSnapshot | undefined,
  setLatestDoc: (newDoc: DocumentSnapshot) => void
): Promise<Shader[]> => {
  console.log(latestDoc);
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
    const shader = await shaderConverter.fromFirestore(doc);
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
  const user = auth.currentUser;
  if (user) {
    return await getShaders(
      collection(firedb, "users", user.uid, "shaders"),
      pageLength
    );
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
  await addDoc(collection(firedb, "example-shaders"), data);
};

export const makeShaderPublic = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, true);
};

export const makeShaderPrivate = async (shader: Shader): Promise<boolean> => {
  return await toggleShaderPublicity(shader, true);
};
