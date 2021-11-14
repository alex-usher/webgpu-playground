import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import DialogTitle from "@mui/material/DialogTitle";
import { MeshType, MeshTypeFromValue } from "../objects/Shader";

const NewShaderButton = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [meshString, setMeshString] = useState<string>(MeshType.RECTANGLE);

  const meshOptions = Object.values(MeshType).map((value) => {
    return <FormControlLabel value={value} control={<Radio />} label={value} />;
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
              aria-label="quiz"
              name="quiz"
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
