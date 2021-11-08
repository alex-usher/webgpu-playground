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

  const visability = shader.isPublic ? "Public" : "Private";
  return (
    <Grid item xs={12} sx={{ width: "15em", height: "15em" }}>
      <Card
        variant="outlined"
        sx={{ width: "15em", height: "15em" }}
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
            background: "#4F5358",
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
              variant="h4"
              align="center"
              className="shadercard-text"
              noWrap={!isHover}
            >
              {shader.title}
            </Typography>

            <Typography
              variant="body1"
              align="right"
              className="visability"
              sx={{
                position: "absolute",
                bottom: "0",
                right: "0",
                padding: "3px",
              }}
            >
              {visability}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
