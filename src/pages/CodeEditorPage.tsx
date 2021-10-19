import Button from "@mui/material/Button";
import Editor from '../components/Editor'
import ShaderCanvas from "../components/ShaderCanvas";
import {useState} from 'react'

import "../assets/style.css";
import "../assets/codeEditorPage.css"

interface CodeEditorPageProps {
    defaultVertexCode: string
    defaultFragmentCode: string
}

const CodeEditorPage = ({defaultVertexCode, defaultFragmentCode}: CodeEditorPageProps) => {
    const [vertexCode, setVertexCode] = useState("")
    const [fragmentCode, setFragmentCode] = useState("")
    const [showCode, setShowCode] = useState(false)
    const [viewCodeText, setViewCodeText] = useState("View Code")
    const [renderedVertexCode, setRenderedVertexCode] = useState("")
    const [renderedFragmentCode, setRenderedFragmentCode] = useState("")

    return (
        <div id="body">
            <div className="paddedDiv">
                <Button id="show-code-button" variant="outlined" disableElevation onClick={() => {
                    setShowCode(!showCode)
                    setViewCodeText(showCode ? "View Code" : "Hide Code")
                }} color={"primary"}>{viewCodeText}</Button>
                {showCode ? <Button id="compile-button" variant="outlined" disableElevation
                 color="secondary" style={{margin: "0 0 0 1em"}} onClick={()=> {
                     setRenderedVertexCode(vertexCode)
                     setRenderedFragmentCode(fragmentCode)
                     }}>Compile</Button> : <></>}
            </div>
            <ShaderCanvas vertexCode={renderedVertexCode || defaultVertexCode} fragmentCode={renderedFragmentCode || defaultFragmentCode} />
            <div className="editors">
                <div className="vertex-editor">
                    {showCode ? <Editor value={vertexCode || defaultVertexCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {setVertexCode(e.target.value)}}/> : <></>}
                </div>
                <div className="fragment-editor">
                    {showCode ? <Editor value={fragmentCode || defaultFragmentCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setFragmentCode(e.target.value) }} /> : <></>}
                </div>
            </div>
        </div>
    )
}


export default CodeEditorPage