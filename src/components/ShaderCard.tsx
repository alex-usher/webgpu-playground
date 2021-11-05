import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import { Link } from "react-router-dom";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

import { FetchedShader, NonFetchedShaderProps } from "../objects/Shader";
import { useEffect, useState } from "react";

export const ShaderCard = ({ shader }: NonFetchedShaderProps) => {
  const [fetchedShader, setFetchedShader] = useState<FetchedShader | null>();

  useEffect(() => {
    shader
      .doFetchCode()
      .then((fetched: FetchedShader) => setFetchedShader(fetched));
  });

  return (
    <Grid item xs={12}>
      <Card variant="outlined">
        <CardActionArea
          component={Link}
          to={{ pathname: "/editor", state: { fetchedShader } }}
          className="shader-card"
          style={{ height: "20%", background: "#4F5358", color: "white" }}
        >
          <CardMedia
            className="shader-card-image"
            component="img"
            src={shader.image}
          />
          <CardContent>
            <Typography variant="h4" align="left">
              {shader.title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};
