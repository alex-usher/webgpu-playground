import Button from "@mui/material/Button";
import Editor from '../components/Editor'
import ShaderCanvas from "../components/ShaderCanvas";
import {useState} from 'react'

import "../assets/style.css";

const CodeEditorPage = () => {
    const [code, setCode] = useState("")
    const [showCode, setShowCode] = useState(false)
    const [renderedCode, setRenderedCode] = useState("")

    let buttonText: string = "View Code"

    return (
        <div id="body">
            <div className="paddedDiv">
                <Button variant="outlined" disableElevation onClick={() => {
                    setShowCode(!showCode)
                    buttonText = showCode ? "View Code" : "Hide Code"
                }} color={"primary"}>{buttonText}</Button>
                {showCode ? <Button variant="outlined" disableElevation 
                 color="secondary" style={{margin: "0 0 0 1em"}} onClick={()=> {
                     setRenderedCode(code)

                     }}>Compile</Button> : <></>}
            </div>
            <ShaderCanvas editorCode={renderedCode} />
            <div>
                {showCode ? <Editor value={code} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {setCode(e.target.value)}}/> : <></>}
            </div>
        </div>
    )
}


export default CodeEditorPage