import React from "react"
import Button from "@mui/material/Button"
import Editor from "../components/Editor"
import ShaderCanvas from "../components/ShaderCanvas"
import { useState } from "react"
import FormDialog from "../components/FormDialog"

import "../assets/style.css";
import "../assets/codeEditorPage.css";

interface CodeEditorPageProps {
  defaultVertexCode: string;
  defaultFragmentCode: string;
}

const CodeEditorPage = ({
  defaultVertexCode,
  defaultFragmentCode,
}: CodeEditorPageProps) => {
  const [vertexCode, setVertexCode] = useState(defaultVertexCode);
  const [fragmentCode, setFragmentCode] = useState(defaultFragmentCode);
  const [showCode, setShowCode] = useState(false);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [renderedVertexCode, setRenderedVertexCode] =
    useState(defaultVertexCode);
  const [renderedFragmentCode, setRenderedFragmentCode] =
    useState(defaultFragmentCode);

  const [formOpen, setFormOpen] = React.useState(false);
  const handleFormOpen = () => {
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  return (
    <div id="body">
      <div className="paddedDiv">
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
        {showCode ? (
          <Button
            id="compile-button"
            variant="outlined"
            disableElevation
            color="secondary"
            style={{ margin: "0 0 0 1em" }}
            onClick={() => {
              setRenderedVertexCode(vertexCode);
              setRenderedFragmentCode(fragmentCode);
            }}
          >
            Compile
          </Button>
        ) : (
          <></>
        )}
        {showCode ? (
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
        ) : (
          <></>
        )}
        <FormDialog
          open={formOpen}
          handleClose={handleFormClose}
          vertexCode={vertexCode}
          fragmentCode={fragmentCode}
        />
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
