import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { useState } from "react";

import { Shader } from "../objects/Shader";
import { overwriteShader } from "../utils/firebaseHelper";

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  shader: Shader;
  updateShader: (shader: Shader) => void;
}

const FormDialog = ({
  open,
  handleClose,
  shader,
  updateShader,
}: FormDialogProps) => {
  const [fileName, setFileName] = useState(shader.title);

  const resetAndClose = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose}>
      <DialogTitle>Rename Shader</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter a name to rename the shader as.
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
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button
          onClick={async () => {
            if (shader) {
              shader.title = fileName;
              await overwriteShader(shader);
              updateShader(shader);
            }
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
