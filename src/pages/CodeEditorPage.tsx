import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Editor from "../components/Editor";
import ShaderCanvas from "../components/ShaderCanvas";
import { useEffect, useState } from "react";
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
  const [formOpen, setFormOpen] = useState(false);
  const [imagePath, setImagePath] = useState("");

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

  useEffect(() => {
    const fileTag = document.getElementById("filetag");
    const preview = document.getElementById("preview");

    console.log(fileTag);

    fileTag?.addEventListener("change", function () {
      changeImage(this);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function changeImage(input: any) {
      console.log("!!!!!!");
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        console.log("??");

        reader.onload = function (e) {
          console.log("hello", e?.target?.result);
          const path = (e?.target?.result as string) || "";
          preview?.setAttribute("src", path);
          setImagePath(path);
        };

        reader.readAsDataURL(input.files[0]);
      }
    }
  }, [showCode]);

  return (
    <div id="body">
      <div className="paddedDiv">
        <Grid container direction="row" justifyContent="flex-start">
          <Grid item container direction="row" spacing={2} xs={12} md={6}>
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
                    <>
                      <Button
                        id="save-button"
                        variant="outlined"
                        disableElevation
                        color="success"
                        style={{ margin: "0 0 0 1em" }}
                        onClick={handleFormOpen}
                      >
                        Save
                      </Button>
                      {/* <Button
                        variant="outlined"
                        disableElevation
                        onClick={() => fileInput?.current?.click()}
                      > */}
                      <input
                        id="filetag"
                        type="file"
                        accept="image/png, image/jpeg"
                      />
                      <img src="../sad.jpeg" id="preview" />
                    </>
                  ) : (
                    <></>
                  )}
                  <FormDialog
                    open={formOpen}
                    handleClose={handleFormClose}
                    vertexCode={vertexCode}
                    fragmentCode={fragmentCode}
                  />
                </Grid>{" "}
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
        imagePath={imagePath}
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
