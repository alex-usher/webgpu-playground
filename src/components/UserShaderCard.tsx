// import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
// import Paper from "@mui/material/Paper";
// import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
// import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
// import CardMedia from "@mui/material/CardMedia";
// import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ShaderProps } from "../objects/Shader";
import {
  deleteShader,
  makeShaderPrivate,
  makeShaderPublic,
} from "../utils/firebaseHelper";

const UserShaderCard = ({ shader }: ShaderProps) => {
  const [publicChecked, setPublicChecked] = useState(shader.isPublic);

  useEffect(() => {
    console.log(shader.isPublic);
  }, [shader.isPublic]);

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
              variant="h4"
              align="center"
              style={{ paddingTop: "10vh", fontWeight: "lighter" }}
            >
              {shader.title}
            </Typography>
          </Stack>
        </CardActionArea>
        <Stack
          direction="column"
          alignContent="center"
          style={{ paddingLeft: "2%", paddingRight: "3%", paddingTop: "0.3%" }}
          justifyContent="center"
          spacing={2.5}
        >
          <FormGroup>
            <FormControlLabel
              onChange={async (e) => {
                let success = false;
                const checked = (e.target as HTMLInputElement).checked;
                if (checked) {
                  console.log("here");
                  success = await makeShaderPublic(shader);
                  console.log("set");
                } else {
                  success = await makeShaderPrivate(shader);
                }

                if (success) {
                  setPublicChecked(checked);
                  shader.isPublic = checked;
                } else {
                  // Reset the toggle if the operation failed to avoid confusion
                  (e.target as HTMLInputElement).checked = !checked;
                }
              }}
              control={<Switch checked={publicChecked} />}
              labelPlacement="top"
              label={publicChecked ? "Public" : "Private"}
            />
          </FormGroup>

          <IconButton
            style={{ borderRadius: "10%" }}
            onClick={() => deleteShader(shader)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

export default UserShaderCard;
