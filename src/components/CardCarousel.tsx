import { ShaderType } from "../objects/Shader";
import { ShaderCard } from "./ShaderCard";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import "../assets/cardCarousel.css";
import { GetShadersReturnType } from "../utils/firebaseHelper";

interface CarouselProps {
  shaderType: ShaderType;
  shaderQueryResult: GetShadersReturnType;
  pageLength: number;
}

export const CardCarousel = ({
  shaderType,
  shaderQueryResult,
  pageLength,
}: CarouselProps) => {
  const shaderTypeEnum = shaderType.type;
  const queryResultString = JSON.stringify(shaderQueryResult);
  return (
    <div className="row">
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        className="header"
      >
        <Typography variant="h4" className="title">
          {shaderType.sectionName}
        </Typography>
        <Button
          variant="outlined"
          disableElevation
          component={Link}
          to={{
            pathname: shaderType.pageLink,
            state: { shaderTypeEnum, queryResultString, pageLength },
          }}
        >
          See All
        </Button>
      </Grid>
      <div className="row__blocks">
        {shaderQueryResult.shaders.map((shader) => (
          <li key={shader.id} className="row__tile">
            <ShaderCard shader={shader} />
          </li>
        ))}
      </div>
    </div>
  );
};
