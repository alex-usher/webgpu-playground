import { CardCarousel } from "../components/CardCarousel";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import {
  getUserPublicShaders,
  getUserPrivateShaders,
} from "../utils/firebaseHelper";
import { Link } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { useEffect, useState } from "react";
import { NonFetchedShader } from "../objects/Shader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import SignInButton from "../components/SignInButton";
import Stack from "@mui/material/Stack";

import "../assets/style.css";

// eslint-disable-next-line
const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const [privateShaders, setPrivateShaders] = useState<NonFetchedShader[]>([]);
  const [publicShaders, setPublicShaders] = useState<NonFetchedShader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getUserPublicShaders().then((shaders: NonFetchedShader[]) =>
      setPublicShaders(shaders)
    );
    getUserPrivateShaders().then((shaders: NonFetchedShader[]) =>
      setPrivateShaders(shaders)
    );
  });

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
          sectionName="My public shaders"
          shaderList={publicShaders}
        />
        <CardCarousel
          sectionName="My private shaders"
          shaderList={privateShaders}
        />
      </Grid>
    </Container>
  );
};

export default UserPage;
