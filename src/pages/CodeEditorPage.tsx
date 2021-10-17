import ShaderCanvas from "../components/ShaderCanvas";
import Button from "@mui/material/Button";
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import "../assets/style.css";

const theme = createTheme({
    palette: {
        primary: {
            main: '#ffffff'
        },
        secondary: {
            main: '#ff4081'
        }
    }
});

const CodeEditorPage = () => (
    <MuiThemeProvider theme={theme}>
        <div id="body">
            <div>
                <Button variant="outlined" disableElevation onClick={() => {}} color="primary">View Code</Button>
            </div>
            <ShaderCanvas/>
        </div>
    </MuiThemeProvider>
)

export default CodeEditorPage