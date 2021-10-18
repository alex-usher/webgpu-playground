import Button from "@mui/material/Button";
import Editor from '../components/Editor'
import ShaderCanvas from "../components/ShaderCanvas";
import {useState} from 'react'

import "../assets/style.css";

const CodeEditorPage = () => {
    const [code, setCode] = useState("")
    const [showCode, setShowCode] = useState(false)
    const [showCodeText, setShowCodeText] = useState("View Code")

    function changeShowCodeText() {
        showCode ? setShowCodeText("View Code") : setShowCodeText("Hide Code")
    }

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setCode(e.target.value)
    }

    return (
        <div id="body">
            <div className="paddedDiv">
                <Button variant="outlined" disableElevation onClick={() => {
                    setShowCode(!showCode)
                    changeShowCodeText()
                }} color={"primary"}>{showCodeText}</Button>
                {showCode ? <Button variant="outlined" disableElevation onClick={() => {
                }} color="secondary" style={{margin: "0 0 0 1em"}}>Compile</Button> : <></>}
            </div>
            <ShaderCanvas/>
            <div>
                {showCode ? <Editor value={code} onChange={handleChange}/> : <></>}
            </div>
        </div>
    )
}


export default CodeEditorPage