import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";

import "../assets/homePage.css";
import { Shader } from "../objects/Shader";
import HeaderComponent from "../components/HeaderComponent";
import ShaderContainerLarge from "../components/ShaderContainerLarge";

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

        <ShaderContainerLarge shaderList={shaderList} />
      </Grid>
    </Container>
  );
};
export default ShadersPage;
