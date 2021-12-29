import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import { MeshType, Shader } from "../objects/Shader";
import { saveNewShader } from "../utils/firebaseHelper";

interface FormDialogProps {
  open: boolean;
  handleClose: () => void;
  shaderCode: string;
  updateShader: (shader: Shader) => void;
  meshType: MeshType;
  vertexBuffer: string;
  colourBuffer: string;
  numberOfVertices: string;
  numberOfParticles: string;
  imageUrl: string;
  computeCode: string;
}

const FormDialog = ({
  open,
  handleClose,
  shaderCode,
  updateShader,
  meshType,
  vertexBuffer,
  colourBuffer,
  numberOfVertices,
  numberOfParticles,
  imageUrl,
  computeCode,
}: FormDialogProps) => {
  const [fileName, setFileName] = useState("Untitled");
  const [isPublic, setIsPublic] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const resetAndClose = async () => {
    setIsPublic(false);
    setIsWarningOpen(false);
    setFileName("Untitled");
    handleClose();
  };

  const submitForm = async () => {
    const shader = await saveNewShader(
      new Shader(
        "",
        fileName,
        imageUrl,
        isPublic,
        shaderCode,
        meshType,
        vertexBuffer,
        colourBuffer,
        numberOfVertices,
        numberOfParticles,
        imageUrl,
        computeCode
      )
    );
    if (shader) {
      updateShader(shader);
    }
    resetAndClose();
  };

  const warnIfPublic = () => {
    if (isPublic) {
      setIsWarningOpen(true);
    } else {
      submitForm();
    }
  };

  return (
    <div>
      <Dialog
        open={isWarningOpen}
        onClose={() => {
          setIsWarningOpen(false);
        }}
      >
        <DialogTitle>Warning</DialogTitle>
        <DialogContent style={{ display: "flex", justifyContent: "center" }}>
          <DialogContentText>
            Saving your shader as public will allow anyone else who uses the
            site to save it to their personal collection, edit it, and reupload
            it as a public shader under their name. Clicking OK indicates that
            you understand this and consent to this. Otherwise, click cancel to
            go back and save it as a private shader instead.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsWarningOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={submitForm}>OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={resetAndClose}>
        <DialogTitle>Save Shader</DialogTitle>
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
          <Button onClick={warnIfPublic}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormDialog;
