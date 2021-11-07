import SignInButton from "../components/SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { CardCarousel } from "../components/CardCarousel";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Link } from "react-router-dom";
import { Shader } from "../objects/Shader";
import { useEffect, useState } from "react";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";
import { getExampleShaders, getPublicShaders } from "../utils/firebaseHelper";

const HomePage = () => {
  const auth = getAuth();

  const [exampleShaders, setExampleShaders] = useState<Shader[]>([]);
  const [publicShaders, setPublicShaders] = useState<Shader[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getPublicShaders().then((shaders: Shader[]) => {
      setPublicShaders(shaders);
    });
  }, []);

  useEffect(() => {
    getExampleShaders().then((shaders: Shader[]) => {
      setExampleShaders(shaders);
    });
  }, []);

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
                  view my shaders
                </Button>
              </Grid>
            ) : (
              <></>
            )}

            <SignInButton />
          </Grid>
        </Grid>

        <CardCarousel sectionName="Examples" shaderList={exampleShaders} />
        <CardCarousel sectionName="Public" shaderList={publicShaders} />
      </Grid>
    </Container>
  );
};
export default HomePage;
