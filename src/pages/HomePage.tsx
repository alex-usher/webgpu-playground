import SignInButton from "../components/SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { defaultShader } from "../objects/Shader";
import { Link } from "react-router-dom";
import { ShaderCard } from "../components/ShaderCard";

import "../assets/homePage.css";

const HomePage = () => (
  <Container>
    <Grid
      container
      spacing={2}
      style={{ paddingTop: "100px" }}
      alignItems="center"
      justifyContent="flex-end"
    >
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        className="title-header"
      >
        <Grid item>
          <Typography variant="h3">WebGPU Playground</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            disableElevation
            component={Link}
            to="/editor"
          >
            New Shader Sandbox
          </Button>
        </Grid>
        <SignInButton />
      </Grid>
      {/* this.state.shaders.map() */}
      <ShaderCard shader={defaultShader} />
      <ShaderCard shader={defaultShader} />
      <ShaderCard shader={defaultShader} />
    </Grid>
  </Container>
);
export default HomePage;
