import "../assets/style.css";

import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import HeaderComponent from "../components/HeaderComponent";
import ShaderListFilter from "../components/ShaderListFilter";
import UserShaderCard from "../components/UserShaderCard";
import { Shader } from "../objects/Shader";
import { getUserShaders } from "../utils/firebaseHelper";

const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const [shaders, setShaders] = useState<Shader[]>([]);
  const [displayedShaders, setDisplayedShaders] = useState<Shader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
    return <Redirect to="/" />;
  });

  useEffect(() => {
    getUserShaders().then((shaders: Shader[]) => {
      setShaders(shaders);
      setDisplayedShaders(shaders);
    });
  }, []);

  const shaderCards = displayedShaders.map((shader, i) => (
    <UserShaderCard key={i} shader={shader} />
  ));

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
      </Grid>
      <Stack
        direction="row"
        alignItems="bottom"
        justifyContent="space-between"
        style={{ paddingBottom: "1vh" }}
      >
        <Typography
          variant="h4"
          color="white"
          align="left"
          style={{ paddingTop: "1.3vh" }}
        >
          My Shaders
        </Typography>
        <ShaderListFilter
          allShaders={shaders}
          updateDisplayedShaders={(shaders) => setDisplayedShaders(shaders)}
          includeVisibilityFilter={true}
        />
      </Stack>
      <Grid container spacing={2} style={{ paddingTop: "5vh" }}>
        {shaderCards}
      </Grid>
    </Container>
  );
};

export default UserPage;
