import { useState } from "react";
import { Redirect } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import SignInButton from "../components/SignInButton";
import Typography from "@mui/material/Typography";
import { defaultShader } from "../objects/Shader";
import { Link } from "react-router-dom";
import { ShaderCard } from "../components/ShaderCard";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import "../assets/style.css";

//prettier-ignore
const UserPage = () => {
  //const { params: { uid } } = match;

  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  //console.log(uid);

  // Redirect to the homepage if the user logs out 
  if (!isLoggedIn) {
    return <Redirect to="/" />
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
          <Grid item>
            <Typography variant="h3">My Shaders </Typography>
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
      </Grid>
    </Container>
  );
};

export default UserPage;
