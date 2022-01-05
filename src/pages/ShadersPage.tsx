import "../assets/homePage.css";
import "../assets/infiniteScroll.css";

import { DocumentSnapshot } from "@firebase/firestore/lite";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocation } from "react-router-dom";

import HeaderComponent from "../components/HeaderComponent";
import { ShaderCard } from "../components/ShaderCard";
import ShaderListFilter from "../components/ShaderListFilter";
import {
  ExampleShaderType,
  Shader,
  ShaderType,
  ShaderTypeEnum,
  shaderTypeMap,
} from "../objects/Shader";
import { fetchPaginatedShaders } from "../utils/firebaseHelper";

interface ShadersPageProps {
  shaderTypeEnum: ShaderTypeEnum;
  shaderList: Shader[];
  pageLength: number;
}

const ShadersPage = () => {
  const location = useLocation();
  const { shaderTypeEnum, pageLength } = location.state as ShadersPageProps;
  const [prevPage, setPrevPage] = useState(0);
  const [currentShaders, setCurrentShaders] = useState<Shader[]>([]);
  const [displayedShaders, setDisplayedShaders] = useState<Shader[]>([]);
  const shaderType: ShaderType =
    shaderTypeMap.get(shaderTypeEnum) || ExampleShaderType;
  const [latestDoc, setLatestDoc] = useState<DocumentSnapshot | undefined>();

  useEffect(() => {
    fetchMoreShaders();
  }, []);

  const fetchMoreShaders = async () => {
    const newShaders = await fetchPaginatedShaders(
      shaderTypeEnum,
      pageLength,
      latestDoc,
      setLatestDoc
    );
    setCurrentShaders([...currentShaders, ...newShaders]);
    setDisplayedShaders([...currentShaders, ...newShaders]);
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
        <HeaderComponent usersPage={false} />
      </Grid>
      <Stack
        direction="row"
        alignItems="bottom"
        justifyContent="space-between"
        style={{ paddingBottom: "3vh" }}
      >
        <Typography
          variant="h4"
          color="white"
          align="left"
          style={{ paddingTop: "1.3vh" }}
        >
          {shaderType.sectionName}
        </Typography>

        <ShaderListFilter
          allShaders={currentShaders}
          updateDisplayedShaders={(shaders) => setDisplayedShaders(shaders)}
        />
      </Stack>

      <InfiniteScroll
        dataLength={currentShaders.length}
        next={() => {
          fetchMoreShaders();
        }}
        hasMore={currentShaders.length <= pageLength * prevPage}
        loader={<></>}
        style={{ paddingBottom: "5%", height: "60vh" }}
        height={"60vh"}
      >
        <div className="image-grid">
          {displayedShaders.map((shader) => (
            <div className="image-item">
              <ShaderCard shader={shader} />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </Container>
  );
};
export default ShadersPage;
