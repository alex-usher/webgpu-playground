import { useState } from "react";
import SignInButton from "../components/SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "@firebase/auth";

import "../assets/homePage.css";
import { Shader } from "../objects/Shader";
import { ShaderCard } from "../components/ShaderCard";
import { ImageList, ImageListItem } from "@mui/material";

interface ExampleProps {
  shaderList: Shader[];
}

const ExamplesPage = () => {
  const location = useLocation();
  const { shaderList } = location.state as ExampleProps;
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  return (
    <Container>
      <Grid
        container
        spacing={2}
        style={{ paddingTop: "100px" }}
        alignItems="center"
        justifyContent="space-between"
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

          {isLoggedIn ? (
            <Grid item>
              <Button
                variant="outlined"
                disableElevation
                component={Link}
                to={"/user/" + auth.currentUser?.uid}
              >
                My shaders
              </Button>
            </Grid>
          ) : (
            <></>
          )}

          <SignInButton />
        </Grid>
        <Grid item>
          <Typography variant="h4" color="white" align="left">
            Examples
          </Typography>
        </Grid>
        <ImageList cols={4} rowHeight={220}>
          {shaderList.map((shader) => (
            <ImageListItem key={shader.image} style={{ padding: "20px" }}>
              <ShaderCard shader={shader} />
            </ImageListItem>
          ))}
        </ImageList>
      </Grid>
    </Container>
  );
};
export default ExamplesPage;
