import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import SignInButton from "../components/SignInButton";
import Stack from "@mui/material/Stack";
import { CardCarousel } from "../components/CardCarousel";
import { Shader } from "../objects/Shader";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { useEffect, useState } from "react";

import "../assets/style.css";
import {
  getUserPrivateShaders,
  getUserPublicShaders,
} from "../utils/firebaseHelper";

const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const [publicShaders, setPublicShaders] = useState<Shader[]>([]);
  const [privateShaders, setPrivateShaders] = useState<Shader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getUserPublicShaders().then((shaders: Shader[]) =>
      setPublicShaders(shaders)
    );
  }, []);

  useEffect(() => {
    getUserPrivateShaders().then((shaders: Shader[]) =>
      setPrivateShaders(shaders)
    );
  }, []);

  // Redirect to the homepage if the user logs out
  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Container>
      <Grid
        container
        spacing={2}
        className="container-grid"
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
            <Button
              variant="outlined"
              disableElevation
              component={Link}
              startIcon={<ArrowBackIcon />}
              className="header-button"
              to="/"
            >
              {"Back to home"}
            </Button>
          </Grid>

          <Stack direction="row" spacing={3}>
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
            <SignInButton />
          </Stack>
        </Grid>

        <CardCarousel
          pageLink="/mypublicshaders"
          sectionName="My public shaders"
          shaderList={publicShaders}
        />
        <CardCarousel
          pageLink="/myprivateshaders"
          sectionName="My private shaders"
          shaderList={privateShaders}
        />
      </Grid>
    </Container>
  );
};

export default UserPage;
