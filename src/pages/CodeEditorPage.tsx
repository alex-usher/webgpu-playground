import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import { useState } from "react";
import React from "react";
//import { Link } from "react-router-dom";
import FormDialog from "../components/FormDialog";

import { ShaderProps } from "../objects/Shader";

import "../assets/style.css";
import "../assets/codeEditorPage.css";

const CodeEditorPage = ({ shader }: ShaderProps) => {
  const [vertexCode, setVertexCode] = useState(shader.vertexCode);
  const [fragmentCode, setFragmentCode] = useState(shader.fragmentCode);
  const [showCode, setShowCode] = useState(false);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [renderedVertexCode, setRenderedVertexCode] = useState(
    shader.vertexCode
  );
  const [renderedFragmentCode, setRenderedFragmentCode] = useState(
    shader.fragmentCode
  );
  const [editorOpacity, setEditorOpacity] = useState(0.5);
  const [formOpen, setFormOpen] = React.useState(false);

  const [shaderName, setShaderName] = useState("");

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
        <Grid container direction="row" justifyContent="flex-start">
          <Grid item container direction="row" spacing={2} xs={12} md={6}>
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
              </>
            ) : (
              <></>
            )}
          </Grid>

          {showCode ? (
            <Grid
              item
              container
              direction="row"
              justifyContent="flex-end"
              spacing={2}
              xs={12}
              md={6}
            >
              <Grid item>
                <Button variant="text" disableElevation color="primary">
                  Editor Opacity
                </Button>
              </Grid>
              <Grid item style={{ minWidth: "250px", paddingRight: "1.5em" }}>
                <Slider
                  color="primary"
                  value={editorOpacity}
                  onChange={handleOpacitySlider}
                  min={0.3}
                  step={0.001}
                  max={1}
                />
              </Grid>
            </Grid>
          ) : (
            <></>
          )}
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
