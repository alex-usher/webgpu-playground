import React from "react"
import Button from "@mui/material/Button"
import Editor from "../components/Editor"
import ShaderCanvas from "../components/ShaderCanvas"
import {useState} from "react"
import FormDialog from "../components/FormDialog"

import {ShaderProps} from "../objects/Shader"

import "../assets/style.css"
import "../assets/codeEditorPage.css"

const CodeEditorPage = ({shader}: ShaderProps) => {
    const [vertexCode, setVertexCode] = useState(shader.vertexCode)
    const [fragmentCode, setFragmentCode] = useState(shader.fragmentCode)
    const [showCode, setShowCode] = useState(false)
    const [viewCodeText, setViewCodeText] = useState("View Code")
    const [renderedVertexCode, setRenderedVertexCode] = useState(shader.vertexCode)
    const [renderedFragmentCode, setRenderedFragmentCode] = useState(shader.fragmentCode)
    const [formOpen, setFormOpen] = React.useState(false)

    const handleFormOpen = () => {
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
    }

    return (
        <div id="body">
            <div className="paddedDiv">
                <Button id="show-code-button" variant="outlined" disableElevation
                        onClick={() => {
                            setShowCode(!showCode);
                            setViewCodeText(showCode ? "View Code" : "Hide Code");
                        }}
                        color={"primary"}>
                    {viewCodeText}
                </Button>
                {showCode ? (
                    <Button id="compile-button" variant="outlined" disableElevation
                            color="secondary" style={{margin: "0 0 0 1em"}}
                            onClick={() => {
                                setRenderedVertexCode(vertexCode);
                                setRenderedFragmentCode(fragmentCode);
                            }}>
                        Compile
                    </Button>
                ) : (
                    <></>
                )}
                {showCode ? (
                    <Button id="save-button" variant="outlined" disableElevation color="success"
                            style={{margin: "0 0 0 1em"}} onClick={handleFormOpen}>
                        Save
                    </Button>
                ) : (
                    <></>
                )}
                <FormDialog open={formOpen} handleClose={handleFormClose} vertexCode={vertexCode}
                            fragmentCode={fragmentCode}/>
            </div>
            <ShaderCanvas vertexCode={renderedVertexCode} fragmentCode={renderedFragmentCode}/>
            <div className="editors">
                <div className="vertex-editor">
                    {showCode ? (
                        <Editor value={vertexCode}
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
                        <Editor value={fragmentCode}
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
    )
}

export default CodeEditorPage
