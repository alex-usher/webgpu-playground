import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { useState } from "react";

import { Shader } from "../objects/Shader";
import { overwriteShader } from "../utils/firebaseHelper";

interface EditFormDialogProps {
  open: boolean;
  handleClose: () => void;
  shader: Shader;
}

const EditFormDialog = ({ open, handleClose, shader }: EditFormDialogProps) => {
  const [fileName, setFileName] = useState(shader.title);
  const [isPublic, setIsPublic] = useState(shader.isPublic);

  const resetAndClose = () => {
    setIsPublic(isPublic);
    setFileName(fileName);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={resetAndClose}>
      <DialogTitle>Edit Shader Details</DialogTitle>
      <DialogContent>
        {/* <DialogContentText>Edit the shader name</DialogContentText> */}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name of shader file"
          type="text"
          fullWidth
          variant="standard"
          name={fileName}
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
          onClick={async () => {
            const newShader = new Shader(
              shader?.id,
              fileName,
              shader?.image,
              isPublic,
              shader?.shaderCode,
              shader?.meshType
            );
            overwriteShader(newShader);
            resetAndClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditFormDialog;
