import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import { useState, useEffect } from "react";
import React from "react";
import { useLocation } from "react-router-dom";
import FormDialog from "../components/FormDialog";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import { Shader } from "../objects/Shader";
import { getShaderCode } from "../utils/firebaseHelper";

import "../assets/style.css";
import "../assets/codeEditorPage.css";

const CodeEditorPage = () => {
  const location = useLocation();
  console.log(location.state);
  let shader = location.state as Shader;
  console.log(shader);

  const [vertexCode, setVertexCode] = useState(
    shader.vertexCode ? shader.vertexCode : ""
  );
  const [fragmentCode, setFragmentCode] = useState(
    shader.fragmentCode ? shader.fragmentCode : ""
  );
  const [showCode, setShowCode] = useState(false);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [renderedVertexCode, setRenderedVertexCode] = useState(
    shader.vertexCode ? shader.vertexCode : ""
  );
  const [renderedFragmentCode, setRenderedFragmentCode] = useState(
    shader.fragmentCode ? shader.fragmentCode : ""
  );
  const [inFullscreen, setInFullscreen] = useState(false);
  const [editorOpacity, setEditorOpacity] = useState(0.5);
  const [formOpen, setFormOpen] = React.useState(false);

  const [shaderName, setShaderName] = useState("");

  useEffect(() => {
    console.log("Updating: ", shader);
    getShaderCode(shader).then((shaderWithCode) => {
      shader = shaderWithCode;
      setVertexCode(shader.vertexCode ? shader.vertexCode : "");
      setFragmentCode(shader.fragmentCode ? shader.fragmentCode : "");
    });
  }, []);

  const handleFormOpen = () => {
    setFormOpen(true);
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
            {/*
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
            </Grid>*/}
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
                      setRenderedVertexCode(vertexCode);
                      setRenderedFragmentCode(fragmentCode);
                    }}
                  >
                    Compile
                  </Button>
                </Grid>
                <Grid item>
                  {showCode ? (
                    <Button
                      id="save-button"
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
                    vertexCode={vertexCode}
                    fragmentCode={fragmentCode}
                  />
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
                      Save As
                    </Button>
                  ) : (
                    <></>
                  )}
                  <FormDialog
                    open={formOpen}
                    handleClose={handleFormClose}
                    vertexCode={vertexCode}
                    fragmentCode={fragmentCode}
                  />
                </Grid>
                <Grid item>
                  {showCode ? (
                    <TextField
                      id="shader-name-box"
                      label="Shader name"
                      variant="outlined"
                      // TODO: sort out focus - when you leave the text box the focus leaves too
                      autoFocus
                      // TODO: we need to make the text actually visible, right now it's black
                      color="info"
                      size="small"
                      value={shaderName}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setShaderName(e.target.value);
                      }}
                      style={{ width: "30ch" }}
                    />
                  ) : (
                    <></>
                  )}
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
                    <Switch />
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

      <ShaderCanvas
        vertexCode={renderedVertexCode}
        fragmentCode={renderedFragmentCode}
      />
      <div className="editors">
        <div className="vertex-editor">
          {showCode ? (
            <Editor
              value={vertexCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setVertexCode(e.target.value);
              }}
              opacity={editorOpacity}
            />
          ) : (
            <></>
          )}
        </div>
        <div className="fragment-editor">
          {showCode ? (
            <Editor
              value={fragmentCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFragmentCode(e.target.value);
              }}
              opacity={editorOpacity}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
