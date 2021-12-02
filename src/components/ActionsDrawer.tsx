import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DoneIcon from "@mui/icons-material/Done";
import {
  Button,
  Drawer,
  IconButton,
  Slider,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router";

import { MeshType, Shader } from "../objects/Shader";
import { deleteShader } from "../utils/firebaseHelper";
import SnackbarUtils from "../utils/Snackbar";

interface ActionsDrawerProps {
  toggleHelpVisible: () => void;
  editorOpacity: number;
  setEditorOpacity: (opacity: number) => void;
  shader: Shader;
  shaderName: string;
  meshType: MeshType;
  setRenderedImageUrl: (url: string) => void;
}

const ActionsDrawer = ({
  toggleHelpVisible,
  editorOpacity,
  setEditorOpacity,
  shader,
  shaderName,
  meshType,
  setRenderedImageUrl,
}: ActionsDrawerProps) => {
  const [open, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const history = useHistory();

  const handleOpacitySlider = (e: Event, newValue: number | number[]) => {
    // the slider value could be a number of a list of numbers - we need to accomodate for this to pass typescipt checks
    if (!Array.isArray(newValue)) {
      setEditorOpacity(newValue);
    }
  };

  const editorActionComponents = [
    <Button
      key="export-button"
      id="export-button"
      variant="outlined"
      disableElevation
      onClick={() => {
        const canvas = document.getElementById(
          "canvas-webgpu"
        ) as HTMLCanvasElement;
        const link = document.createElement("a");
        link.download = "shader.png";

        canvas.toBlob(function (blob) {
          link.href = URL.createObjectURL(blob);
          link.click();
        }, "image/png");
      }}
      color="primary"
    >
      Export as PNG
    </Button>,
    <Button
      key="help-button"
      id="help-button"
      variant="outlined"
      disableElevation
      onClick={() => {
        toggleHelpVisible();
        setIsOpen(!open);
      }}
      color="secondary"
    >
      Help
    </Button>,
    <Button
      key="delete-button"
      id="delete-button"
      variant="outlined"
      disableElevation
      color="error"
      onClick={async () => {
        try {
          await deleteShader(shader).then(() => {
            SnackbarUtils.success("Successfully deleted " + shaderName + ".");
            history.goBack();
          });
        } catch (error) {
          SnackbarUtils.error("Failed to delete " + shaderName + ".");
        }
      }}
    >
      Delete
    </Button>,
    ...(meshType === MeshType.TEXTURED_RECTANGLE
      ? [
          <div
            key="upload-image-url-div"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <TextField
              label="Image URL"
              variant="outlined"
              size="small"
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <IconButton
              size="small"
              onClick={() => setRenderedImageUrl(imageUrl)}
            >
              <DoneIcon />
            </IconButton>
          </div>,
        ]
      : []),
  ];

  const opacitySliderComponent = (
    <Stack
      key="stack"
      alignItems="center"
      direction="row"
      justifyContent="center"
      spacing={1.5}
    >
      <Button
        key="slider-text"
        variant="text"
        disableRipple
        disableElevation
        color="primary"
        style={{ backgroundColor: "transparent", paddingTop: "0.6em" }}
      >
        Opacity
      </Button>
      <Slider
        key="slider"
        color="primary"
        value={editorOpacity}
        onChange={handleOpacitySlider}
        min={0.3}
        step={0.001}
        max={1}
        style={{ minWidth: "150px", maxWidth: "200px" }}
      />
    </Stack>
  );
  return (
    <>
      <Button
        id="editor-action-dropdown"
        variant="outlined"
        disableElevation
        color="primary"
        endIcon={<ArrowDropDownIcon />}
        onClick={() => setIsOpen(!open)}
      >
        {"Code Actions"}
      </Button>
      <Drawer anchor={"right"} open={open} onClose={() => setIsOpen(!open)}>
        <Stack
          direction="column"
          spacing={5}
          style={{
            paddingTop: "5vh",
            paddingLeft: "2vh",
            paddingRight: "2vh",
          }}
        >
          {editorActionComponents.concat([opacitySliderComponent])}
        </Stack>
      </Drawer>
    </>
  );
};

export default ActionsDrawer;
