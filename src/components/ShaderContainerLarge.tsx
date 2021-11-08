import Grid from "@mui/material/Grid";

import "../assets/homePage.css";
import { Shader } from "../objects/Shader";
import { ShaderCard } from "../components/ShaderCard";

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
        <Grid item>
          <ShaderCard shader={shader} />
        </Grid>
      ))}
    </Grid>
  );
};
export default ShaderContainerLarge;
