import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useState } from "react";
import { Link } from "react-router-dom";

import { MeshType, MeshTypeFromValue } from "../objects/Shader";

const NewShaderButton = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [meshString, setMeshString] = useState<string>(MeshType.RECTANGLE);

  const meshOptions = Object.values(MeshType).map((value) => {
    return (
      <FormControlLabel
        key={value}
        value={value}
        control={<Radio />}
        label={value}
      />
    );
  });

  return (
    <>
      <Button
        variant="outlined"
        disableElevation
        onClick={() => {
          setFormOpen(true);
        }}
        className="header-button"
      >
        New Shader Sandbox
      </Button>
      <Dialog open={formOpen}>
        <DialogTitle>New Shader Sandbox</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Pick a mesh</FormLabel>
            <RadioGroup
              value={meshString}
              onChange={(event) => {
                setMeshString(event.target.value);
              }}
            >
              {meshOptions}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              console.log();
              setFormOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            component={Link}
            to={{
              pathname: "/editor",
              state: {
                meshType: MeshTypeFromValue(meshString),
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewShaderButton;
