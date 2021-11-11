import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";

import "../assets/homePage.css";
import {
  ExampleShaderType,
  Shader,
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

interface ShadersPageProps {
  shaderTypeEnum: ShaderTypeEnum;
  shaderList: Shader[];
  pageLength: number;
}

const ShadersPage = () => {
  const location = useLocation();
  const { shaderTypeEnum, shaderList, pageLength } =
    location.state as ShadersPageProps;
  const [prevPage, setPrevPage] = useState(1);
  const [currentShaders, setCurrentShaders] = useState(shaderList);
  const shaderType: ShaderType =
    shaderTypeMap.get(shaderTypeEnum) || ExampleShaderType;

  const fetchMoreShaders = async () => {
    console.log("fetching");
    const res = await shaderType.fetch(pageLength, prevPage);
    console.log(res);
    setCurrentShaders(currentShaders.concat(res));
    setPrevPage(prevPage + 1);
  };

  console.log("prev page", prevPage);
  console.log("curr length", shaderList.length);
  console.log(pageLength * prevPage);

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
            next={fetchMoreShaders}
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
