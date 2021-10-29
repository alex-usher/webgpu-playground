import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ref, uploadString } from "firebase/storage";
import { firestorage, firedb } from "../firebase";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { useState } from "react";

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  vertexCode: string;
  fragmentCode: string;
}

const saveShaderCode = (
  vertexCode: string,
  fragmentCode: string,
  shaderName: string,
  isPublic: boolean
) => {
  const vertexFile = uuidv4() + shaderName + "_vertex.txt";
  const fragmentFile = uuidv4() + shaderName + "_fragment.txt";

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

  if (isPublic) {
    addDoc(collection(firedb, "public-shaders"), shaderDoc);
  }

  const user = getAuth().currentUser;
  if (user) {
    const usersShadersRef = collection(firedb, "users", user.uid, "shaders");
    addDoc(usersShadersRef, shaderDoc);
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
            saveShaderCode(vertexCode, fragmentCode, fileName, isPublic);
            resetAndClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog