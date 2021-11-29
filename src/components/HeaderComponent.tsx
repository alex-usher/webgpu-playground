import SignInButton from "../components/SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import LinkMui from "@mui/material/Link";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Link } from "react-router-dom";
import { useState } from "react";

import NewShaderButton from "./NewShaderButton";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";

interface HeaderComponentProps {
  usersPage: boolean;
}

const HeaderComponent = ({ usersPage }: HeaderComponentProps) => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  return (
    <Grid container alignItems="center" spacing={3} className="title-header">
      <Grid item xs={12} md={6}>
        <LinkMui href="/" variant="h3" color="white" underline="none">
          WebGPU Playground
        </LinkMui>
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
          <NewShaderButton />
        </Grid>

        {!usersPage && isLoggedIn ? (
          <Grid item>
            <Button
              variant="outlined"
              disableElevation
              component={Link}
              to={"/user/" + auth.currentUser?.uid}
              className="header-button"
            >
              View My Shaders
            </Button>
          </Grid>
        ) : (
          <></>
        )}

        <SignInButton />
      </Grid>
    </Grid>
  );
};
export default HeaderComponent;
