import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import { Link } from "react-router-dom";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import { ShaderProps } from "../objects/Shader";
import { useState } from "react";

export const ShaderCard = ({ shader }: ShaderProps) => {
  const [isHover, setIsHover] = useState(false);

  const visibility = shader.isPublic ? "Public" : "Private";
  const color = shader.isPublic ? "#cbceef" : "#9accff";
  // if anyone can refactor this hex code to be the warning color instead that would be idea
  return (
    <Grid item xs={12} sx={{ width: "15em", height: "14em" }}>
      <Card
        variant="outlined"
        sx={{ width: "100%", height: "100%" }}
        className="whole-card"
        onMouseOver={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <CardActionArea
          component={Link}
          to={{ pathname: "/editor", state: { shader } }}
          className="shader-card"
          style={{
            height: "100%",
            background: "#000",
            color: "white",
          }}
        >
          <CardMedia
            className="shader-card-image"
            component="img"
            src={shader.image}
          />
          <CardContent className="card-textbox">
            <Typography
              variant="h6"
              align="center"
              className="shadercard-text"
              noWrap={!isHover}
              style={{ fontWeight: 400 }}
            >
              {shader.title}
            </Typography>

            <Typography
              variant="caption"
              align="center"
              className="visibility"
              sx={{
                display: isHover ? "inherit" : "none",
              }}
              color={color}
            >
              {visibility}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
