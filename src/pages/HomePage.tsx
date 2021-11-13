import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { CardCarousel } from "../components/CardCarousel";
import { ExampleShaderType, PublicShaderType } from "../objects/Shader";
import { useEffect, useState } from "react";

import "../assets/homePage.css";
import "../assets/shaderGallery.css";
import {
  getExampleShaders,
  getPublicShaders,
  GetShadersReturnType,
} from "../utils/firebaseHelper";
import HeaderComponent from "../components/HeaderComponent";

const PAGE_LENGTH = 3;

const HomePage = () => {
  const [exampleShaderQueryResult, setExampleShaderQueryResult] =
    useState<GetShadersReturnType>();
  const [publicShaderQueryResult, setPublicShaderQueryResult] =
    useState<GetShadersReturnType>();

  useEffect(() => {
    getPublicShaders(PAGE_LENGTH).then((res: GetShadersReturnType) => {
      setPublicShaderQueryResult(res);
    });
  }, []);

  useEffect(() => {
    getExampleShaders(PAGE_LENGTH).then((res: GetShadersReturnType) => {
      setExampleShaderQueryResult(res);
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

        {exampleShaderQueryResult && (
          <CardCarousel
            shaderType={ExampleShaderType}
            shaderQueryResult={exampleShaderQueryResult}
            pageLength={PAGE_LENGTH}
          />
        )}
        {publicShaderQueryResult && (
          <CardCarousel
            shaderType={PublicShaderType}
            shaderQueryResult={publicShaderQueryResult}
            pageLength={PAGE_LENGTH}
          />
        )}
      </Grid>
    </Container>
  );
};
export default HomePage;
