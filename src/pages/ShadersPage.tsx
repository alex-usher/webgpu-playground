import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";

import "../assets/homePage.css";
import {
  ExampleShaderType,
  //Shader,
  ShaderType,
  ShaderTypeEnum,
  shaderTypeMap,
} from "../objects/Shader";
import HeaderComponent from "../components/HeaderComponent";
//import ShaderContainerLarge from "../components/ShaderContainerLarge";
import { Loading } from "react-loading-dot/lib";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { ShaderCard } from "../components/ShaderCard";
import { DocumentSnapshot } from "@firebase/firestore/lite";
import { GetShadersReturnType } from "../utils/firebaseHelper";

interface ShadersPageProps {
  shaderTypeEnum: ShaderTypeEnum;
  queryResultString: string;
  pageLength: number;
}

const ShadersPage = () => {
  const location = useLocation();
  const { shaderTypeEnum, queryResultString, pageLength } =
    location.state as ShadersPageProps;
  const shaderQueryResult = JSON.parse(
    queryResultString
  ) as GetShadersReturnType;
  const [prevPage, setPrevPage] = useState(1);
  const [currentShaders, setCurrentShaders] = useState(
    shaderQueryResult.shaders
  );
  const [latestDoc, setLatestDoc] = useState<DocumentSnapshot | undefined>(
    shaderQueryResult.newLatestDoc
  );
  const shaderType: ShaderType =
    shaderTypeMap.get(shaderTypeEnum) || ExampleShaderType;

  const fetchMoreShaders = () => {
    console.log("fetcing");
    console.log(latestDoc);
    shaderType
      .fetch(pageLength, latestDoc)
      .then((res) => {
        setCurrentShaders([...currentShaders, ...res.shaders]);
        setLatestDoc(res.newLatestDoc);
      })
      .catch((err) => {
        console.log(err);
      });
    setPrevPage(prevPage + 1);
  };

  return (
    <Container>
      <Grid
        container
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        className="container-grid"
      >
        <HeaderComponent />
        <Grid item>
          <Typography variant="h4" color="white" align="left">
            {shaderType.sectionName}
          </Typography>
        </Grid>
        <Grid
          container
          spacing={2}
          alignItems="center"
          className="container-grid"
          padding="2%"
        >
          <InfiniteScroll
            dataLength={currentShaders.length}
            next={() => {
              fetchMoreShaders();
            }}
            hasMore={currentShaders.length >= pageLength * prevPage}
            loader={<Loading />}
          >
            {currentShaders.map((shader) => (
              <Grid item key={shader.id}>
                <ShaderCard shader={shader} />
              </Grid>
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
    </Container>
  );
};
export default ShadersPage;
