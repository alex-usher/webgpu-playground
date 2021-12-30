import "../assets/homePage.css";
import "../assets/shaderGallery.css";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";

import { CardCarousel } from "../components/CardCarousel";
import FooterComponent from "../components/FooterComponent";
import HeaderComponent from "../components/HeaderComponent";
import { ExampleShaderType, PublicShaderType, Shader } from "../objects/Shader";
import { getExampleShaders, getPublicShaders } from "../utils/firebaseHelper";

const PAGE_LENGTH = 12;

const HomePage = () => {
  const [exampleShaders, setExampleShaders] = useState<Shader[]>([]);
  const [publicShaders, setPublicShaders] = useState<Shader[]>([]);

  useEffect(() => {
    getPublicShaders(PAGE_LENGTH).then((shaders: Shader[]) => {
      setPublicShaders(shaders);
    });
  }, []);

  useEffect(() => {
    getExampleShaders(PAGE_LENGTH).then((shaders: Shader[]) => {
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
        marginBottom="10px"
      >
        <HeaderComponent usersPage={false} />

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
      <FooterComponent />
    </Container>
  );
};
export default HomePage;
