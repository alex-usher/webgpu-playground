import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { CardCarousel } from "../components/CardCarousel";
import { ExampleShaderType, PublicShaderType, Shader } from "../objects/Shader";
import { useEffect, useState } from "react";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";
import { getExampleShaders, getPublicShaders } from "../utils/firebaseHelper";
import HeaderComponent from "../components/HeaderComponent";

const PAGE_LENGTH = 1;

const HomePage = () => {
  const [exampleShaders, setExampleShaders] = useState<Shader[]>([]);
  const [publicShaders, setPublicShaders] = useState<Shader[]>([]);

  useEffect(() => {
    getPublicShaders(PAGE_LENGTH, 0).then((shaders: Shader[]) => {
      setPublicShaders(shaders);
    });
  }, []);

  useEffect(() => {
    getExampleShaders(PAGE_LENGTH, 0).then((shaders: Shader[]) => {
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
          shaderType={ExampleShaderType}
          shaderList={exampleShaders}
          pageLength={PAGE_LENGTH}
        />
        <CardCarousel
          shaderType={PublicShaderType}
          shaderList={publicShaders}
          pageLength={PAGE_LENGTH}
        />
      </Grid>
    </Container>
  );
};
export default HomePage;
