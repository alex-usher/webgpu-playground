import "../assets/homePage.css";

import Grid from "@mui/material/Grid";

import { ShaderCard } from "../components/ShaderCard";
import { Shader } from "../objects/Shader";

interface ShadersContainerProps {
  shaderList: Shader[];
}

const ShaderContainerLarge = (props: ShadersContainerProps) => {
  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      className="container-grid"
      padding="2%"
    >
      {props.shaderList.map((shader) => (
        <Grid item key={shader.id}>
          <ShaderCard shader={shader} />
        </Grid>
      ))}
    </Grid>
  );
};
export default ShaderContainerLarge;
