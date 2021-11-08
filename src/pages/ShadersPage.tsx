import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";

import "../assets/homePage.css";
import { Shader } from "../objects/Shader";
import { ShaderCard } from "../components/ShaderCard";
import { ImageList, ImageListItem } from "@mui/material";
import HeaderComponent from "../components/HeaderComponent";

interface ShadersPageProps {
  sectionName: string;
  shaderList: Shader[];
}

const ShadersPage = () => {
  const location = useLocation();
  const { sectionName, shaderList } = location.state as ShadersPageProps;
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
            {sectionName}
          </Typography>
        </Grid>
        <ImageList cols={4} rowHeight={220}>
          {shaderList.map((shader) => (
            <ImageListItem key={shader.image} style={{ padding: "1vw" }}>
              <ShaderCard shader={shader} />
            </ImageListItem>
          ))}
        </ImageList>
      </Grid>
    </Container>
  );
};
export default ShadersPage;
