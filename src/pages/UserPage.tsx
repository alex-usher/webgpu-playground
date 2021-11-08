import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
//import { CardCarousel } from "../components/CardCarousel";
import { Shader } from "../objects/Shader";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Redirect } from "react-router-dom";
import { useEffect, useState } from "react";

import "../assets/style.css";
import {
  getUserShaders,
  // getUserPrivateShaders,
  //getUserPublicShaders,
} from "../utils/firebaseHelper";
import ShaderContainerLarge from "../components/ShaderContainerLarge";
import { Typography } from "@mui/material";
import HeaderComponent from "../components/HeaderComponent";

const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  //const [publicShaders, setPublicShaders] = useState<Shader[]>([]);
  //const [privateShaders, setPrivateShaders] = useState<Shader[]>([]);
  const [shaders, setShaders] = useState<Shader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    getUserShaders().then((shaders: Shader[]) => setShaders(shaders));
  }, []);

  /*useEffect(() => {
    getUserPublicShaders().then((shaders: Shader[]) =>
      setPublicShaders(shaders)
    );
  }, []);

  useEffect(() => {
    getUserPrivateShaders().then((shaders: Shader[]) =>
      setPrivateShaders(shaders)
    );
  }, []);*/

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
        <HeaderComponent />
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
