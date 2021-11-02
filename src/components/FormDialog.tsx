import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ref, uploadString } from "@firebase/storage";
import { collection, addDoc, doc, setDoc } from "@firebase/firestore/lite";
import { auth, firestorage, firedb } from "../firebase";
import { v4 as uuidv4 } from "uuid";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { useState } from "react";
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar,
} from "notistack";

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  vertexCode: string;
  fragmentCode: string;
}

const saveShaderCode = async (
  vertexCode: string,
  fragmentCode: string,
  shaderName: string,
  isPublic: boolean,
  enqueueSnackbar: {
    (
      message: SnackbarMessage,
      options?: OptionsObject | undefined
    ): SnackbarKey;
  }
) => {
  const vertexFile = uuidv4() + "_" + shaderName + "_vertex.txt";
  const fragmentFile = uuidv4() + "_" + shaderName + "_fragment.txt";

  const vertexRef = ref(firestorage, vertexFile);
  const fragmentRef = ref(firestorage, fragmentFile);

  uploadString(vertexRef, vertexCode);
  uploadString(fragmentRef, fragmentCode);

  const shaderDoc = {
    shader_name: shaderName,
    vertex_code: vertexFile,
    fragment_code: fragmentFile,
    isPublic: isPublic,
  };

  try {
    let shaderId = null;
    if (isPublic) {
      shaderId = (await addDoc(collection(firedb, "public-shaders"), shaderDoc))
        .id;
    }
    const user = auth.currentUser;
    if (user) {
      if (shaderId) {
        await setDoc(
          doc(firedb, "users", user.uid, "shaders", shaderId),
          shaderDoc
        );
      } else {
        const usersShadersRef = collection(
          firedb,
          "users",
          user.uid,
          "shaders"
        );
        await addDoc(usersShadersRef, shaderDoc);
      }
    }
  } catch (err) {
    enqueueSnackbar("Failed to save", {
      variant: "error",
      autoHideDuration: 1000,
    });
  } finally {
    enqueueSnackbar("Successfully saved!", {
      variant: "success",
      autoHideDuration: 1000,
    });
  }
};

const FormDialog = ({
  open,
  handleClose,
  vertexCode,
  fragmentCode,
}: FormDialogProps) => {
  const [fileName, setFileName] = useState("no name provided");
  const [isPublic, setIsPublic] = useState(false);

  const resetAndClose = () => {
    setIsPublic(false);
    setFileName("no name provided");
    handleClose();
  };

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Dialog open={open} onClose={resetAndClose}>
      <DialogTitle>Save Shader</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter a name to save the shader as - this can then be accessed
          at a later time
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name of shader file"
          type="text"
          fullWidth
          variant="standard"
          onChange={(name) => setFileName(name.target.value)}
        />
        <FormGroup>
          <FormControlLabel
            onChange={(e) =>
              setIsPublic((e.target as HTMLInputElement).checked)
            }
            control={<Switch />}
            label="Make Publicly Available"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button
          onClick={() => {
            saveShaderCode(
              vertexCode,
              fragmentCode,
              fileName,
              isPublic,
              enqueueSnackbar
            );
            resetAndClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormDialog;
