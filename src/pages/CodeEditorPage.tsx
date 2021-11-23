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
import HelpBanner from "../components/HelpBanner";
import FormDialog from "../components/FormDialog";
import Drawer from "@mui/material/Drawer";
import {
  getShaderCode,
  overwriteShader,
  isCurrentUsersShader,
} from "../utils/firebaseHelper";
import { useEffect, useState, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import SnackbarUtils from "../utils/Snackbar";

import "../assets/style.css";
import "../assets/codeEditorPage.css";

import { auth } from "../firebase";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Tooltip } from "@mui/material";
import { ConsoleOutput } from "../components/ConsoleOutput";
import React from "react";

import KeyboardShortcut from "../utils/keyboardShortcuts";
import { addShortcuts } from "../utils/shortcutListener";

// Shortcut patterns
const altT = new KeyboardShortcut("T", false, false, true);
const altH = new KeyboardShortcut("H", false, false, true);
const ctrlS = new KeyboardShortcut("S", false, true);

const CodeEditorPage = () => {
  const [shader, setShader] = useState<Shader>(
    useLocation().state
      ? (useLocation().state as { shader: Shader }).shader
      : defaultShader
  );

  const showCodeRef = useRef(false);
  const editorWidthRef = useRef("100%");
  const helpBoxVisableRef = React.useRef(false);
  const formOpenRef = React.useRef(false);

  const [shaderCode, setShaderCode] = useState(shader.shaderCode);
  const [showCode, setShowCode] = useState(showCodeRef.current);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [renderedShaderCode, setRenderedShaderCode] = useState(
    shader.shaderCode
  );
  const [messages, setMessages] = useState("");
  const [inFullscreen, setInFullscreen] = useState(false);
  const [editorOpacity, setEditorOpacity] = useState(0.5);
  const [formOpen, setFormOpen] = React.useState(formOpenRef.current);
  const [actionDrawerOpen, setActionDrawerOpen] = React.useState(false);
  const [shaderName, setShaderName] = useState("Untitled");
  const history = useHistory();
  const isLoggedIn = auth.currentUser == null;
  const [helpBoxVisable, setHelpBoxVisable] = React.useState(
    helpBoxVisableRef.current
  );
  const [editorWidth, setEditorWidth] = useState(editorWidthRef.current);

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
    const shortcuts = [
      {
        shortcut: altT,
        action: () => {
          toggleShowCode();
        },
      },
      {
        shortcut: altH,
        action: () => {
          toggleHelpVisible();
        },
      },
      {
        shortcut: ctrlS,
        action: async () => {
          await handleFormOpen();
        },
      },
    ];
    addShortcuts("*", shortcuts);
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
      formOpenRef.current = true;
      setFormOpen(formOpenRef.current);
    }
  };

  const handleFormClose = () => {
    setShaderName(shader.title);
    formOpenRef.current = false;
    setFormOpen(formOpenRef.current);
  };

  const handleOpacitySlider = (e: Event, newValue: number | number[]) => {
    // the slider value could be a number of a list of numbers - we need to accomodate for this to pass typescipt checks
    if (!Array.isArray(newValue)) {
      setEditorOpacity(newValue);
    }
  };

  const isSmallWidth = useMediaQuery(useTheme().breakpoints.down("xl"));

  const toggleShowCode = () => {
    showCodeRef.current = !showCodeRef.current;
    setShowCode(showCodeRef.current);
    setViewCodeText(showCode ? "View Code" : "Hide Code");
  };

  const toggleHelpVisible = () => {
    helpBoxVisableRef.current = !helpBoxVisableRef.current;
    setHelpBoxVisable(helpBoxVisableRef.current);
    {
      !helpBoxVisableRef.current
        ? (editorWidthRef.current = "100%")
        : (editorWidthRef.current = "75%");
    }
    setEditorWidth(editorWidthRef.current);
  };

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
      color="secondary"
      onClick={() => {
        setRenderedShaderCode(shaderCode);
      }}
    >
      Compile
    </Button>,
    <div key={9}>
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
    <Button
      key={4}
      id="help-button"
      variant="outlined"
      disableElevation
      onClick={() => {
        toggleHelpVisible();
        toggleActionDrawer();
      }}
      color={"secondary"}
    >
      Help
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
                onClick={toggleShowCode}
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

      <ShaderCanvas shaderCode={renderedShaderCode} setMessages={setMessages} />
      {showCode ? <ConsoleOutput messages={messages} /> : <></>}

      <div className="editors">
        {helpBoxVisable ? (
          <HelpBanner
            opacity={editorOpacity}
            toggleVisibility={toggleHelpVisible}
          />
        ) : (
          <></>
        )}
        {showCode ? (
          <div style={{ height: "100%", width: editorWidth, float: "left" }}>
            <Editor
              value={shaderCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setShaderCode(e.target.value);
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
