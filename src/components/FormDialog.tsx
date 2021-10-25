import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ref, uploadString } from "firebase/storage";
import { firestorage, firedb } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  vertexCode: string;
  fragmentCode: string;
}

const saveShaderCode = (
  vertexCode: string,
  fragmentCode: string,
  shaderName: string
) => {
  const vertexFile = uuidv4() + shaderName + "_vertex.txt";
  const fragmentFile = uuidv4() + shaderName + "_fragment.txt";

  const vertexRef = ref(firestorage, vertexFile);
  const fragmentRef = ref(firestorage, fragmentFile);

  uploadString(vertexRef, vertexCode);
  uploadString(fragmentRef, fragmentCode);

  addDoc(collection(firedb, "public-shaders"), {
    shader_name: shaderName,
    vertex_code: vertexFile,
    fragment_code: fragmentFile,
  });
};
export default function FormDialog({
  open,
  handleClose,
  vertexCode,
  fragmentCode,
}: FormDialogProps) {
  
  return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name to save the shader as - this can then be
            accessed at a later time
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name of shader file"
            type="text"
            fullWidth
            variant="standard"
          />
          <FormGroup>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Make Publicly Available"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={()=>{
            saveShaderCode(vertexCode, fragmentCode, "shader name");
            handleClose();
          }}>Save</Button>
        </DialogActions>
      </Dialog>
  );
}
