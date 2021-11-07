import { useState } from "react";
import SignInButton from "../components/SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { defaultShader } from "../objects/Shader";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { CardCarousel } from "../components/CardCarousel";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";

const HomePage = () => {
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
        className="container-grid"
        alignItems="center"
      >
        <Grid
          container
          alignItems="center"
          spacing={3}
          className="title-header"
        >
          <Grid item xs={12} md={6}>
            <Typography variant="h3">WebGPU Playground</Typography>
          </Grid>

          <Grid
            item
            container
            alignItems="center"
            justifyContent="flex-end"
            xs={12}
            md={6}
            spacing={3}
          >
            <Grid item>
              <Button
                variant="outlined"
                disableElevation
                component={Link}
                to="/editor"
                className="header-button"
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
                  className="header-button"
                >
                  View My Shaders
                </Button>
              </Grid>
            ) : (
              <></>
            )}

            <SignInButton />
          </Grid>
        </Grid>

        <CardCarousel
          sectionName="Examples"
          pageLink="/examples"
          shaderList={[
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
          ]}
        />

        <CardCarousel
          sectionName="Recent Public Shaders"
          pageLink="/public"
          shaderList={[
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
          ]}
        />
      </Grid>
    </Container>
  );
};
export default HomePage;
