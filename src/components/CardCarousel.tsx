import "../assets/cardCarousel.css";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

import { Shader, ShaderType } from "../objects/Shader";
import { ShaderCard } from "./ShaderCard";

interface CarouselProps {
  shaderType: ShaderType;
  shaderList: Shader[];
  pageLength: number;
}

export const CardCarousel = ({
  shaderType,
  shaderList,
  pageLength,
}: CarouselProps) => {
  const shaderTypeEnum = shaderType.type;
  return (
    <div className="row">
      <Grid item className="header">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
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
              state: { shaderTypeEnum, shaderList, pageLength },
            }}
          >
            See All
          </Button>
        </Stack>
      </Grid>
      <div className="row__blocks">
        {shaderList.map((shader) => (
          <li key={shader.id} className="row__tile">
            <ShaderCard shader={shader} />
          </li>
        ))}
      </div>
    </div>
  );
};
