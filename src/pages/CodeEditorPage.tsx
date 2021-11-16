import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { defaultShader, Shader } from "../objects/Shader";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import React from "react";
//import { Link } from "react-router-dom";
import FormDialog from "../components/FormDialog";
import Drawer from "@mui/material/Drawer";
import {
  getShaderCode,
  overwriteShader,
  isCurrentUsersShader,
} from "../utils/firebaseHelper";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import SnackbarUtils from "../utils/Snackbar";

import "../assets/style.css";
import "../assets/codeEditorPage.css";

import { auth } from "../firebase";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Tooltip } from "@mui/material";
import { ConsoleOutput } from "../components/ConsoleOutput";
import { RenderLogger } from "../objects/RenderLogger";

const CodeEditorPage = () => {
  const renderLogger = new RenderLogger();

  const [shader, setShader] = useState<Shader>(
    useLocation().state
      ? (useLocation().state as { shader: Shader }).shader
      : defaultShader
  );
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
  /* states relating to error messages, warnings */
  const [messages, setMessages] = useState("");
  const [hasErrors, setHasErrors] = useState(false);
  const [hasWarnings, setHasWarnings] = useState(false);

  /*
   * messages change each recompile - we want to
   * update our errors/warnings states accordingly
   */
  useEffect(() => {
    setHasWarnings(renderLogger.hasWarnings());
    setHasErrors(renderLogger.hasErrors());
  }, [messages]);

  const history = useHistory();
  const isLoggedIn = auth.currentUser == null;

  useEffect(() => {
    if (shader.shaderCode === "") {
      getShaderCode(shader).then((shaderWithCode: Shader) => {
        setShader(shaderWithCode);
        setShaderCode(shader.shaderCode);
        setRenderedShaderCode(shader.shaderCode);
        // Only set the name if getting an existing shader - new shaders will display "untitled"
        setShaderName(shader.title);
      });
    }
  }, []);

  useEffect(() => {
    shader.shaderCode = shaderCode;
  }, [shaderCode]);

  const handleFormOpen = async () => {
    if (!auth.currentUser) {
      SnackbarUtils.error("You must be logged in to save a shader.");
      return;
    }
    if ((await isCurrentUsersShader(shader)) && shader.id) {
      overwriteShader(shader);
    } else {
      setFormOpen(true);
    }
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
    <Button
      key={1}
      id="compile-button"
      variant="outlined"
      disableElevation
      color={hasErrors ? "error" : hasWarnings ? "warning" : "success"}
      onClick={() => {
        setRenderedShaderCode(shaderCode);
      }}
    >
      Compile
    </Button>,
    <div>
      {isLoggedIn ? (
        <Tooltip title="You must be logged in to be able to save shaders.">
          <span>
            <Button
              key={2}
              id="save-button"
              variant="contained"
              disabled
              disableElevation
              fullWidth
            >
              Save
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          key={2}
          id="save-button"
          variant="outlined"
          disableElevation
          fullWidth
          color="success"
          onClick={handleFormOpen}
        >
          Save
        </Button>
      )}
    </div>,
    <Button
      key={3}
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
      color={"primary"}
    >
      Export as PNG
    </Button>,
    <FormDialog
      key={5}
      open={formOpen}
      handleClose={handleFormClose}
      shaderCode={shaderCode}
      updateShader={(shader) => setShader(shader)}
    />,
  ];

  const opacitySliderComponent = (
    <Stack
      key={6}
      alignItems="center"
      direction="row"
      justifyContent="center"
      spacing={1.5}
    >
      <Button
        key={7}
        variant="text"
        disableRipple
        disableElevation
        color="primary"
        style={{ backgroundColor: "transparent", paddingTop: "0.6em" }}
      >
        Opacity
      </Button>
      <Slider
        key={8}
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
                onClick={() => {
                  history.goBack();
                }}
                color="primary"
                startIcon={<ArrowBackIcon />}
              >
                {"Back"}
              </Button>
            </Grid>
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
              <Typography
                variant="h5"
                style={{ color: "lightGrey", fontSize: "3vh" }}
              >
                {shaderName}
              </Typography>
            </Grid>
          </Grid>

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
            {showCode ? (
              <>
                {/* Display editor opacity normally if screen is wide, hide in a drawer otherwise */}
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

      <ShaderCanvas
        shaderCode={renderedShaderCode}
        renderLogger={renderLogger}
        setMessages={setMessages}
      />
      {showCode ? <ConsoleOutput messages={messages} /> : <></>}

      <div className="editors">
        {showCode ? (
          <div style={{ height: "100%" }}>
            <Editor
              value={shaderCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setShaderCode(e.target.value);
                setRenderedShaderCode(e.target.value); // live recompile
              }}
              opacity={editorOpacity}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPage;
