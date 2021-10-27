import Button from "@mui/material/Button";
import Editor from '../components/Editor';
import ShaderCanvas from "../components/ShaderCanvas";
import { useState } from 'react';
import { ref, uploadString } from "firebase/storage";
import { firestorage, firedb } from "../firebase"
import { collection, addDoc } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"
import { useSnackbar } from 'notistack'

import "../assets/style.css";
import "../assets/codeEditorPage.css";

interface CodeEditorPageProps {
    defaultVertexCode: string
    defaultFragmentCode: string
}

const CodeEditorPage = ({ defaultVertexCode, defaultFragmentCode }: CodeEditorPageProps) => {
    const [vertexCode, setVertexCode] = useState(defaultVertexCode)
    const [fragmentCode, setFragmentCode] = useState(defaultFragmentCode)
    const [showCode, setShowCode] = useState(false)
    const [viewCodeText, setViewCodeText] = useState("View Code")
    const [renderedVertexCode, setRenderedVertexCode] = useState(defaultVertexCode)
    const [renderedFragmentCode, setRenderedFragmentCode] = useState(defaultFragmentCode)
    const {enqueueSnackbar} = useSnackbar()

    const saveShaderCode = (vertexCode: string, fragmentCode: string, shaderName: string) => {
        const vertexFile = uuidv4() + shaderName + "_vertex.txt"
        const fragmentFile = uuidv4() + shaderName + "_fragment.txt"

        const vertexRef = ref(firestorage, vertexFile);
        const fragmentRef = ref(firestorage, fragmentFile);

        uploadString(vertexRef, vertexCode)
        uploadString(fragmentRef, fragmentCode)

        addDoc(collection(firedb, "public-shaders"), {
            shader_name: shaderName,
            vertex_code: vertexFile,
            fragment_code: fragmentFile,
        }).then(res => {
            enqueueSnackbar('Successfully saved!', {variant: 'success', autoHideDuration: 1000})
        }).catch(err => {
            enqueueSnackbar('Failed to save', {variant: 'error', autoHideDuration: 1000})
        })
    }

    return (
        <div id="body">
            <div className="paddedDiv">
                <Button id="show-code-button" variant="outlined" disableElevation onClick={() => {
                    setShowCode(!showCode)
                    setViewCodeText(showCode ? "View Code" : "Hide Code")
                }} color={"primary"}>{viewCodeText}</Button>
                {showCode ? <Button id="compile-button" variant="outlined" disableElevation
                    color="secondary" style={{ margin: "0 0 0 1em" }} onClick={() => {
                        setRenderedVertexCode(vertexCode)
                        setRenderedFragmentCode(fragmentCode)
                    }}>Compile</Button> : <></>}
                {showCode ? <Button id="save-button" variant="outlined" disableElevation
                    color="success" style={{ margin: "0 0 0 1em" }} onClick={() => {
                        saveShaderCode(vertexCode, fragmentCode, "shader name")
                    }}>Save</Button> : <></>}
            </div>
            <ShaderCanvas vertexCode={renderedVertexCode} fragmentCode={renderedFragmentCode} />
            <div className="editors">
                <div className="vertex-editor">
                    {showCode ? <Editor value={vertexCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setVertexCode(e.target.value) }} /> : <></>}
                </div>
                <div className="fragment-editor">
                    {showCode ? <Editor value={fragmentCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setFragmentCode(e.target.value) }} /> : <></>}
                </div>
            </div>
        </div >
    )
}


export default CodeEditorPage