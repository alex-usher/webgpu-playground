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

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [shaders, setShaders] = useState<Shader[]>([]);
  const [displayedShaders, setDisplayedShaders] = useState<Shader[]>([]);

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  useEffect(() => {
    // On reload, the auth is also reloaded - wait for state to change before getting shaders
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserShaders().then((shaders: Shader[]) => {
          setShaders(shaders);
          // Initially display all shaders without filtering
          setDisplayedShaders(shaders);
        });
      }
    });
  }, []);

  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

  const shaderCards = displayedShaders.map((shader, i) => (
    <UserShaderCard
      key={i}
      shader={shader}
      removeCard={() => {
        const shaderID = shader.id;
        // remove the selected shader card from the displayed and full list
        const newShaders = shaders.filter((shader) => shader.id != shaderID);
        const newDisplayed = displayedShaders.filter(
          (shader) => shader.id != shaderID
        );
        setShaders(newShaders);
        setDisplayedShaders(newDisplayed);
      }}
    />
  ));

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
