import { Close } from "@mui/icons-material";
import { Card, Grid, IconButton, Typography } from "@mui/material";

import { structs } from "../webgpu/shaders";

interface BannerProps {
  opacity?: number;
  toggleVisibility: () => void;
}

export const HelpBanner = ({
  opacity = 0.5,
  toggleVisibility,
}: BannerProps) => {
  return (
    <div
      className="help-card"
      style={{
        width: "25%",
        height: "100%",
        float: "left",
      }}
    >
      <Card
        sx={{
          height: "100%",

          whiteSpace: "pre-wrap",
          backgroundColor: `rgb(50, 50, 50, ${opacity})`,
          borderRadius: "0.35em",
          scrollBehavior: "smooth",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Grid container>
          <Grid item xs={11} sx={{ padding: "0.5em" }}>
            <Typography variant="h6" color="white">
              Predefined Uniforms:
            </Typography>
            <Typography
              sx={{
                fontFamily: "monospace",
                padding: "0.2em",
                fontSize: "0.86em",
                color: "rgba(208, 208, 208, 0.9)",
              }}
            >
              {structs}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <IconButton
              onClick={toggleVisibility}
              style={{
                fontSize: "3vh",
              }}
              edge="start"
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default HelpBanner;
