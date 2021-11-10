import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import { useEffect, useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import FormDialog from "../components/FormDialog";
import Drawer from "@mui/material/Drawer";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { defaultShader, Shader } from "../objects/Shader";

import "../assets/style.css";
import "../assets/codeEditorPage.css";
import { getShaderCode } from "../utils/firebaseHelper";
import { useLocation } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const CodeEditorPage = () => {
  const location = useLocation();

  // The state cast to any is needed to stop typescript errors
  // eslint-disable-next-line
  const state = location.state as any;
  let shader = defaultShader;
  if (state && state.shader) {
    shader = state.shader;
  }

  const [shaderCode, setShaderCode] = useState(shader.shaderCode);
  const [showCode, setShowCode] = useState(false);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [renderedShaderCode, setRenderedShaderCode] = useState(
    shader.shaderCode
  );
  const [inFullscreen, setInFullscreen] = useState(false);
  const [editorOpacity, setEditorOpacity] = useState(0.5);
  const [formOpen, setFormOpen] = React.useState(false);
  const [actionDrawerOpen, setActionDrawerOpen] = React.useState(false);
  const [shaderName, setShaderName] = useState("Untitled");

  useEffect(() => {
    if (shader.shaderCode === "") {
      getShaderCode(shader).then((shaderWithCode: Shader) => {
        shader = shaderWithCode;
        setShaderCode(shader.shaderCode);
        setRenderedShaderCode(shader.shaderCode);
        // Only set the name if getting an existing shader - new shaders will display "untitled"
        setShaderName(shader.title);
      });
    }
  }, [shader]);

  const handleFormOpen = () => {
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setShaderName(shader.title);
    setFormOpen(false);
  };

  const handleOpacitySlider = (e: Event, newValue: number | number[]) => {
    // the slider value could be a number of a list of numbers - we need to accomodate for this to pass typescipt checks
    if (!Array.isArray(newValue)) {
      setEditorOpacity(newValue);
    }
  };

  const isSmallWidth = useMediaQuery(useTheme().breakpoints.down("xl"));

  const toggleActionDrawer = () => {
    // Only allow the drawer to open if the code actions button is available
    if (isSmallWidth) {
      setActionDrawerOpen(!actionDrawerOpen);
    } else {
      setActionDrawerOpen(false);
    }
  };

  const editorActionComponents = [
    // <Button
    //   id="compile-button"
    //   variant="outlined"
    //   disableElevation
    //   color="secondary"
    //   onClick={() => {
    //     setRenderedShaderCode(shaderCode);
    //   }}
    // >
    //   Compile
    // </Button>,
    // <Button
    //   id="save-button"
    //   variant="outlined"
    //   disableElevation
    //   color="success"
    //   onClick={handleFormOpen}
    // >
    //   Save
    // </Button>,
    // <FormDialog
    //   open={formOpen}
    //   handleClose={handleFormClose}
    //   shaderCode={shaderCode}
    // />,
    // <Button
    //   id="save-as-button"
    //   variant="outlined"
    //   disableElevation
    //   color="success"
    //   onClick={handleFormOpen}
    // >
    //   Save As
    // </Button>,
    // <FormDialog
    //   open={formOpen}
    //   handleClose={handleFormClose}
    //   shaderCode={shaderCode}
    // />,

    <Button
      id="compile-button"
      variant="outlined"
      disableElevation
      color="secondary"
      onClick={() => {
        setRenderedShaderCode(shaderCode);
      }}
    >
      Compile
    </Button>,
    <Button
      id="save-button"
      variant="outlined"
      disableElevation
      color="success"
      onClick={handleFormOpen}
    >
      Save
    </Button>,
    <Button
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
          console.log(blob);
          console.log(link.href);
          link.click();
        }, "image/png");
      }}
      color={"primary"}
    >
      Export as png
    </Button>,
    <Button
      id="save-as-button"
      variant="outlined"
      disableElevation
      color="success"
      onClick={handleFormOpen}
    >
      Save As
    </Button>,
    <FormDialog
      open={formOpen}
      handleClose={handleFormClose}
      shaderCode={shaderCode}
    />,
  ];

  const opacitySliderComponent = (
    <Stack
      alignItems="center"
      direction="row"
      justifyContent="center"
      spacing={1.5}
    >
      <Button
        variant="text"
        disableRipple
        disableElevation
        color="primary"
        style={{ backgroundColor: "transparent", paddingTop: "0.6em" }}
      >
        Opacity
      </Button>
      <Slider
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
    <div id="body">
      <div className="paddedDiv">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Left aligned actions */}
          <Grid
            container
            direction="row"
            spacing={2}
            style={{ minWidth: "55%", maxWidth: "55%" }}
            alignItems="center"
          >
            <Grid item>
              <Button
                id="home-button"
                variant="outlined"
                disableElevation
                component={Link}
                to={"/"}
                color="primary"
                startIcon={<ArrowBackIcon />}
              >
                {"Back to Home"}
              </Button>
            </Grid>
            {/* Show/hide code button */}
            <Grid item>
              <Button
                id="show-code-button"
                variant="outlined"
                disableElevation
                onClick={() => {
                  setShowCode(!showCode);
                  setViewCodeText(showCode ? "View Code" : "Hide Code");
                }}
                color={"primary"}
              >
                {viewCodeText}
              </Button>
            </Grid>
            {/* Actions in showCode mode */}
            {showCode && !isSmallWidth ? (
              <Grid item>
                <Stack direction="row" spacing={2}>
                  {editorActionComponents}
                </Stack>
              </Grid>
            ) : (
              <></>
            )}
          </Grid>

          {/* Shader title (roughly spaced on either side) */}
          <Grid container direction="row" justifyContent="left">
            <Grid item>
              <Typography variant="h4" style={{ color: "lightGrey" }}>
                {shaderName}
              </Typography>
            </Grid>
          </Grid>

          {/* Right aligned actions */}
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Grid item>
              <IconButton
                color="primary"
                style={{ fontSize: "3vh", paddingRight: "2vh" }}
                onClick={() => {
                  setInFullscreen(!inFullscreen);
                  if (!inFullscreen) {
                    const wholePage = document.documentElement;
                    wholePage.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
              >
                {inFullscreen ? (
                  <FullscreenExitIcon fontSize="inherit" />
                ) : (
                  <FullscreenIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
            {/* Display editor opacity normally if screen is wide */}
            {showCode ? (
              <>
                {!isSmallWidth ? (
                  <>{opacitySliderComponent}</>
                ) : (
                  <>
                    <Button
                      id="editor-action-dropdown"
                      variant="outlined"
                      disableElevation
                      color="primary"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={toggleActionDrawer}
                    >
                      {"Code Actions"}
                    </Button>
                    <Drawer
                      anchor={"right"}
                      open={actionDrawerOpen}
                      onClose={toggleActionDrawer}
                    >
                      <Stack
                        direction="column"
                        spacing={5}
                        style={{
                          paddingTop: "5vh",
                          paddingLeft: "2vh",
                          paddingRight: "2vh",
                        }}
                      >
                        {editorActionComponents.concat([
                          opacitySliderComponent,
                        ])}
                      </Stack>
                    </Drawer>
                  </>
                )}{" "}
              </>
            ) : (
              <></>
            )}
          </Grid>
        </Stack>
      </div>

      <ShaderCanvas shaderCode={renderedShaderCode} />
      <div className="editors">
        {showCode ? (
          <Editor
            value={shaderCode}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setShaderCode(e.target.value);
            }}
            opacity={editorOpacity}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPage;
