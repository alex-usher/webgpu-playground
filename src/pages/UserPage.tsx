import "../assets/style.css";

import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { Typography } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import HeaderComponent from "../components/HeaderComponent";
import UserShaderCard from "../components/UserShaderCard";
import { MeshType, Shader, StringFromMeshType } from "../objects/Shader";
import { getUserShaders } from "../utils/firebaseHelper";

const UserPage = () => {
  const auth = getAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser != null);
  const [shaders, setShaders] = useState<Shader[]>([]);

  const toOption = (optionString: string) => {
    return (
      <MenuItem key={optionString} value={optionString}>
        {optionString}
      </MenuItem>
    );
  };

  const visibilityOptions = ["All", "Public", "Private"].map(toOption);
  const meshOptions = [toOption("All")].concat(
    Object.values(MeshType).map(toOption)
  );

  const [searchString, setSearchString] = useState<null | string>(null);
  const [meshFilter, setMeshFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  onAuthStateChanged(auth, (user) => {
    setIsLoggedIn(user != null);
    return <Redirect to="/" />;
  });

  useEffect(() => {
    getUserShaders().then((shaders: Shader[]) => setShaders(shaders));
  }, []);

  // Filter the shaders by the search queries and map to cards
  const shaderCards = shaders
    .filter((shader) => {
      if (
        searchString &&
        !shader.title.toLowerCase().includes(searchString.toLowerCase())
      ) {
        return false;
      }
      if (
        meshFilter != "All" &&
        meshFilter != StringFromMeshType(shader.meshType)
      ) {
        return false;
      }
      if (visibilityFilter != "All") {
        if (shader.isPublic && visibilityFilter == "Private") {
          return false;
        } else if (!shader.isPublic && visibilityFilter == "Public") {
          return false;
        }
      }
      return true;
    })
    .map((shader, i) => <UserShaderCard key={i} shader={shader} />);

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
        <Stack direction="row" spacing={4} alignItems="flex-end">
          <TextField
            id="search"
            label="Filter by string"
            type="text"
            variant="standard"
            onChange={(name) => setSearchString(name.target.value)}
            style={{ minWidth: "15%" }}
          />
          <TextField
            id="meshFilter"
            select
            label="Filter by mesh"
            value={meshFilter}
            onChange={(name) => setMeshFilter(name.target.value)}
            style={{ minWidth: "15vh" }}
          >
            {meshOptions}
          </TextField>
          <TextField
            id="visibilityFilter"
            select
            label="Filter by visibilty"
            value={visibilityFilter}
            onChange={(name) => setVisibilityFilter(name.target.value)}
            style={{ minWidth: "15vh" }}
          >
            {visibilityOptions}
          </TextField>
        </Stack>
      </Stack>
      <Grid container spacing={2} style={{ paddingTop: "5vh" }}>
        {shaderCards}
      </Grid>
    </Container>
  );
};

export default UserPage;
