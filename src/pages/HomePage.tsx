import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { CardCarousel } from "../components/CardCarousel";
import { Shader } from "../objects/Shader";
import { useEffect, useState } from "react";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";
import { getExampleShaders, getPublicShaders } from "../utils/firebaseHelper";
import HeaderComponent from "../components/HeaderComponent";

const HomePage = () => {
  const [exampleShaders, setExampleShaders] = useState<Shader[]>([]);
  const [publicShaders, setPublicShaders] = useState<Shader[]>([]);

  useEffect(() => {
    getPublicShaders().then((shaders: Shader[]) => {
      setPublicShaders(shaders);
    });
  }, []);

  useEffect(() => {
    getExampleShaders().then((shaders: Shader[]) => {
      setExampleShaders(shaders);
    });
  }, []);

  return (
    <Container>
      <Grid
        container
        spacing={2}
        className="container-grid"
        alignItems="center"
      >
        <HeaderComponent />

        <CardCarousel
          pageLink="/examples"
          sectionName="Examples"
          shaderList={exampleShaders}
        />
        <CardCarousel
          pageLink="/public"
          sectionName="Recent Public Shaders"
          shaderList={publicShaders}
        />
      </Grid>
    </Container>
  );
};
export default HomePage;
