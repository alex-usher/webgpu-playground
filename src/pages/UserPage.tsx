import { useState } from "react";
import { Redirect } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import SignInButton from "../components/SignInButton";
import { defaultShader } from "../objects/Shader";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import "../assets/style.css";
import { CardCarousel } from "../components/CardCarousel";

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
          {/*<Grid item>
            <Button variant="outlined" disableElevation component={Link} to="/">
              {"< Back to home"}
            </Button>
          </Grid>*/}
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

        <CardCarousel
          sectionName="My public shaders"
          shaderList={[
            defaultShader,
            defaultShader,
            defaultShader,
            defaultShader,
          ]}
        />
        <CardCarousel
          sectionName="My private shaders"
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
