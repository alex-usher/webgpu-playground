import { useState } from "react";
import SignInButton from "./SignInButton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Link, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "@firebase/auth";

import "../assets/homePage.css";
import { Shader } from "../objects/Shader";
import { ShaderCard } from "./ShaderCard";
import { ImageListItem, Pagination } from "@mui/material";

const PAGE_LENGTH = 20;

interface ShadersComponentProps {
  sectionName: string;
  shaderList: Shader[];
}

const ShadersComponent = () => {
  const location = useLocation();
  const { sectionName, shaderList } = location.state as ShadersComponentProps;
  const [page, setPage] = useState(1);
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
  });

  return (
    <Container>th
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        className="container-grid"
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
            <Typography variant="h3">WebGPU Playground</Typography>
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

          {isLoggedIn ? (
            <Grid item>
              <Button
                variant="outlined"
                disableElevation
                component={Link}
                to={"/user/" + auth.currentUser?.uid}
              >
                My shaders
              </Button>
            </Grid>
          ) : (
            <></>
          )}

          <SignInButton />
        </Grid>
        <Grid item>
          <Typography variant="h4" color="white" align="left">
            {sectionName}
          </Typography>
        </Grid>
        {/* <ImageList cols={4} rowHeight={220}> */}
        {shaderList.map((shader) => (
          <ImageListItem key={shader.image} style={{ padding: "1vw" }}>
            <ShaderCard shader={shader} />
          </ImageListItem>
        ))}
        {/* </ImageList> */}
      </Grid>
      <div>
        <Pagination count={10} page={page} onChange={handleChange} />
      </div>
    </Container>
  );
};
export default ShadersComponent;
