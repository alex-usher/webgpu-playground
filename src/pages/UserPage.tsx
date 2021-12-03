import "../assets/style.css";

import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import HeaderComponent from "../components/HeaderComponent";
import ShaderContainerLarge from "../components/ShaderContainerLarge";
import { Shader } from "../objects/Shader";
import { getUserShaders } from "../utils/firebaseHelper";

const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const [shaders, setShaders] = useState<Shader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getUserShaders().then((shaders: Shader[]) => setShaders(shaders));
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
        justifyContent="space-between"
      >
        <HeaderComponent usersPage={true} />
        <Grid item>
          <Typography variant="h4" color="white" align="left">
            My Shaders
          </Typography>
        </Grid>
        <ShaderContainerLarge shaderList={shaders} />
      </Grid>
    </Container>
  );
};

export default UserPage;
