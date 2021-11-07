import { useState } from "react";
import { Redirect } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import SignInButton from "../components/SignInButton";
import { defaultShader } from "../objects/Shader";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import "../assets/style.css";
import { CardCarousel } from "../components/CardCarousel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// eslint-disable-next-line
const UserPage = ({ match }: any) => {
  // TOOD - use uid to get a user's shaders from firebase
  const uid = match.params.uid;
  console.log(uid);

  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
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
          pageLink="/mypublicshaders"
          shaderList={[
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
          ]}
        />
        <CardCarousel
          sectionName="My private shaders"
          pageLink="/myprivateshaders"
          shaderList={[
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

export default UserPage;
