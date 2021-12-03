// import Paper from "@mui/material/Paper";
// import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import { Link } from "react-router-dom";
// import CardMedia from "@mui/material/CardMedia";
// import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
// import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { ShaderProps } from "../objects/Shader";
// import { useState } from "react";

const UserShaderCard = ({ shader }: ShaderProps) => {
  return (
    // <Paper elevation={3} style={{ height: "20vh", width: "100%" }}>
    <Card style={{ height: "20vh", width: "100%", borderRadius: "1.5vh" }}>
      <Stack
        // alignItems="center"
        justifyContent="space-between"
        spacing={2}
        direction="row"
        style={{
          height: "20vh",
          width: "100%",
          background: "#203035",
          borderRadius: "1.5vh",
          color: "white",
          textAlign: "center",
          // display: "flex",
          // flexDirection: "row",
        }}
      >
        <CardActionArea
          component={Link}
          to={{ pathname: "/editor", state: { shader } }}
        >
          <Stack
            direction="row"
            spacing={5}
            // alignContent="center"
            // alignItems="stretch"
            justifyContent="flex-start"
            style={{ height: "100%" }}
          >
            <Box
              style={{
                padding: "1.8%",
              }}
            >
              <img src={shader.image} style={{ backgroundColor: "black" }} />
            </Box>
            <Typography
              variant="h2"
              align="center"
              style={{ paddingTop: "6vh" }}
            >
              {shader.title}
            </Typography>
          </Stack>
        </CardActionArea>
        <Stack
          direction="column"
          alignContent="center"
          style={{ paddingRight: "3%", paddingLeft: "2%" }}
          justifyContent="center"
          spacing={4}
        >
          <IconButton>
            <EditIcon />
          </IconButton>
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
    // </Paper>
  );
};

export default UserShaderCard;
