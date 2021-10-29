import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Editor from '../components/Editor';
import ShaderCanvas from "../components/ShaderCanvas";
import { useState } from 'react';
import { ref, uploadString } from "firebase/storage";
import { firestorage, firedb } from "../firebase"
import { collection, addDoc } from "firebase/firestore"
import { v4 as uuidv4 } from "uuid"
import { useSnackbar } from 'notistack'

import {ShaderProps} from "../objects/Shader";

import "../assets/style.css";
import "../assets/codeEditorPage.css";


const CodeEditorPage = ({shader}: ShaderProps) => {
    const [vertexCode, setVertexCode] = useState(shader.vertexCode)
    const [fragmentCode, setFragmentCode] = useState(shader.fragmentCode)
    const [showCode, setShowCode] = useState(false)
    const [viewCodeText, setViewCodeText] = useState("View Code")
    const [renderedVertexCode, setRenderedVertexCode] = useState(shader.vertexCode)
    const [renderedFragmentCode, setRenderedFragmentCode] = useState(shader.fragmentCode)
    const [editorOpacity, setEditorOpacity] = useState(0.25)
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

    const handleOpacitySlider = (e: Event, newValue: number | number[]) => {
        // the slider value could be a number of a list of numbers - we need to accomodate for this to pass typescipt checks
        if (!Array.isArray(newValue)) {
            setEditorOpacity(newValue)
        }
    }

    return (
        <div id="body">
            <div className="paddedDiv">
                <Grid container direction="row" justifyContent="flex-start">
                    <Grid item container direction="row" spacing={2} xs={12} md={6}>
                        {/* Show/hide code button */}
                        <Grid item>
                            <Button id="show-code-button" variant="outlined" disableElevation onClick={() => {
                                setShowCode(!showCode)
                                setViewCodeText(showCode ? "View Code" : "Hide Code") 
                            }} color={"primary"}>{viewCodeText}</Button>
                        </Grid>
                        {/* Actions in showCode mode */}
                        {showCode ? 
                            <> <Grid item>
                                <Button id="compile-button" variant="outlined" disableElevation
                                    color="secondary" onClick={() => {
                                        setRenderedVertexCode(vertexCode)
                                        setRenderedFragmentCode(fragmentCode)
                                    }}>Compile</Button> 
                            </Grid>
                            <Grid item>
                                <Button id="save-button" variant="outlined" disableElevation
                                    color="success" onClick={() => {
                                        saveShaderCode(vertexCode, fragmentCode, "shader name")
                                    }}>Save</Button>
                            </Grid> </>: <></>}
                    </Grid>
                    
                    {showCode ? 
                        <Grid item container direction="row" justifyContent="flex-end" spacing={2} xs={12} md={6}>
                            <Grid item>
                                <Button variant="text" disableElevation
                                    color="primary"
                                >Editor Opacity</Button> 
                            </Grid>
                            <Grid item style={{minWidth: "250px", paddingRight:"1.5em"}}>
                                <Slider
                                    color="primary"
                                    value={editorOpacity}
                                    onChange={handleOpacitySlider}
                                    min={0.3}
                                    step={0.001}
                                    max={1}
                                />
                            </Grid>
                        </Grid> : <></>}
                </Grid>
            </div>

            <ShaderCanvas vertexCode={renderedVertexCode} fragmentCode={renderedFragmentCode} />
            <div className="editors">
                <div className="vertex-editor">
                    {showCode ? <Editor value={vertexCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setVertexCode(e.target.value)}} opacity={editorOpacity} /> : <></>}
                </div>
                <div className="fragment-editor">
                    {showCode ? <Editor value={fragmentCode} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setFragmentCode(e.target.value)}} opacity={editorOpacity} /> : <></>}
                </div>
            </div>
        </div >
    )
}


export default CodeEditorPage