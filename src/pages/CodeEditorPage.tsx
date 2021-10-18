import ShaderCanvas from "../components/ShaderCanvas";
import Button from "@mui/material/Button";
import "../assets/style.css";

const CodeEditorPage = () => (
        <div id="body">
            <div className="paddedDiv">
                <Button variant="outlined" disableElevation onClick={() => {}} color={"primary"}>View Code</Button>
            </div>
            <ShaderCanvas/>
        </div>
)

export default CodeEditorPage