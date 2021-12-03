import "../assets/homePage.css";
import "../assets/infiniteScroll.css";

import { DocumentSnapshot } from "@firebase/firestore/lite";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loading } from "react-loading-dot/lib";
import { useLocation } from "react-router-dom";

import HeaderComponent from "../components/HeaderComponent";
import { ShaderCard } from "../components/ShaderCard";
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
        <Grid item>
          <Typography variant="h4" color="white" align="left">
            {shaderType.sectionName}
          </Typography>
        </Grid>
      </Grid>
      <InfiniteScroll
        dataLength={currentShaders.length}
        next={() => {
          fetchMoreShaders();
        }}
        hasMore={currentShaders.length >= pageLength * prevPage}
        loader={<Loading />}
        style={{ paddingTop: "2%", paddingBottom: "5%" }}
      >
        <div className="image-grid">
          {currentShaders.map((shader) => (
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
