import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
// import TextField from "@mui/material/TextField";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import { useEffect, useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import FormDialog from "../components/FormDialog";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import { defaultShader, Shader } from "../objects/Shader";

import "../assets/style.css";
import "../assets/codeEditorPage.css";
import {
  getShaderCode,
  overwriteShader,
  isExampleShader,
} from "../utils/firebaseHelper";
import { useLocation } from "react-router-dom";
// import { useSnackbar } from "notistack";

const CodeEditorPage = () => {
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

  useEffect(() => {
    if (shader.shaderCode === "") {
      getShaderCode(shader).then((shaderWithCode: Shader) => {
        setShader(shaderWithCode);
        setShaderCode(shader.shaderCode);
        setRenderedShaderCode(shader.shaderCode);
      });
    }
    console.log(shader);
  }, []);

  useEffect(() => {
    shader.shaderCode = shaderCode;
  }, [shaderCode]);

  const handleFormOpen = async () => {
    if (!(await isExampleShader(shader)) && shader.id) {
      console.log("overwriting");
      overwriteShader(shader);
    } else {
      console.log("save as new");
      setFormOpen(true);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleOpacitySlider = (e: Event, newValue: number | number[]) => {
    // the slider value could be a number of a list of numbers - we need to accomodate for this to pass typescipt checks
    if (!Array.isArray(newValue)) {
      setEditorOpacity(newValue);
    }
  };

  return (
    <div id="body">
      <div className="paddedDiv">
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Grid
            item
            container
            direction="row"
            spacing={2}
            xs={12}
            md={8}
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
              >
                {"< Back to Home"}
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
            {showCode ? (
              <>
                {" "}
                <Grid item>
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
                  </Button>
                </Grid>
                <Grid item>
                  {showCode ? (
                    <Button
                      id="save-as-button"
                      variant="outlined"
                      disableElevation
                      color="success"
                      onClick={handleFormOpen}
                    >
                      Save
                    </Button>
                  ) : (
                    <></>
                  )}
                  <FormDialog
                    open={formOpen}
                    handleClose={handleFormClose}
                    shaderCode={shaderCode}
                    updateShader={(shader) => setShader(shader)}
                  />
                </Grid>
                <Grid item>
                  <h1>{shader.title ? shader.title : "Untitled"}</h1>
                </Grid>
                <Grid item>
                  <Stack direction="row">
                    <Button
                      variant="text"
                      disableRipple
                      disableElevation
                      color="primary"
                      style={{ backgroundColor: "transparent" }}
                    >
                      Public
                    </Button>
                    {/* TODO Set the default checked value and onClick*/}
                    <Switch onClick={(e) => console.log(e)} />
                  </Stack>
                </Grid>
              </>
            ) : (
              <></>
            )}
          </Grid>

          <Grid
            item
            container
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            xs={12}
            md={4}
            alignItems="center"
          >
            <Grid item>
              <IconButton
                color="primary"
                style={{ fontSize: "3vh" }}
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
                <Grid item style={{ paddingLeft: "1em" }}>
                  <Button
                    variant="text"
                    disableRipple
                    disableElevation
                    color="primary"
                    style={{ backgroundColor: "transparent" }}
                  >
                    Editor Opacity
                  </Button>
                </Grid>
                <Grid item style={{ minWidth: "250px", paddingRight: "1.0em" }}>
                  <Slider
                    color="primary"
                    value={editorOpacity}
                    onChange={handleOpacitySlider}
                    min={0.3}
                    step={0.001}
                    max={1}
                  />
                </Grid>
              </>
            ) : (
              <></>
            )}
          </Grid>
        </Grid>
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
