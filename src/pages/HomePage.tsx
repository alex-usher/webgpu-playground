import { CardCarousel } from "../components/CardCarousel";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { getExampleShaders, getPublicShaders } from "../utils/firebaseHelper";
import { Link } from "react-router-dom";
import { NonFetchedShader } from "../objects/Shader";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SignInButton from "../components/SignInButton";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";

const HomePage = () => {
  const auth = getAuth();

  const [exampleShaders, setExampleShaders] = useState<NonFetchedShader[]>([]);
  const [publicShaders, setPublicShaders] = useState<NonFetchedShader[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getExampleShaders().then((exampleShaders) =>
      setExampleShaders(exampleShaders)
    );

    getPublicShaders().then((publicShaders) => setPublicShaders(publicShaders));
  }, [setExampleShaders, setPublicShaders]);

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
        <CardCarousel
          sectionName="Example Shaders"
          shaderList={exampleShaders}
        />
        <CardCarousel sectionName="Public Shaders" shaderList={publicShaders} />
      </Grid>
    </Container>
  );
};

export default HomePage;
