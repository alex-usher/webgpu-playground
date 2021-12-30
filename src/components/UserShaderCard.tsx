import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Shader } from "../objects/Shader";
import {
  deleteShader,
  getShaderCode,
  makeShaderPrivate,
  makeShaderPublic,
} from "../utils/firebaseHelper";

interface UserShaderCardProps {
  shader: Shader;
  isPublic: boolean;
  removeCard: () => void;
}

interface ConfirmDeleteDialogProps {
  title: string;
  dialogOpen: boolean;
  setDialogOpen: (arg0: boolean) => void;
  doDelete: () => void;
}

const ConfirmDeleteDialog = ({
  title,
  dialogOpen,
  setDialogOpen,
  doDelete,
}: ConfirmDeleteDialogProps) => {
  return (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>Are you sure you want to delete "{title}"?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>No</Button>
        <Button
          onClick={() => {
            setDialogOpen(false);
            doDelete();
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserShaderCard = ({
  shader,
  isPublic,
  removeCard,
}: UserShaderCardProps) => {
  const [publicChecked, setPublicChecked] = useState(isPublic);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  console.log(publicChecked);

  useEffect(() => {
    setPublicChecked(isPublic);
  }, [isPublic]);

  return (
    <Card
      style={{
        height: "20vh",
        width: "100%",
        borderRadius: "1.5vh",
        paddingBottom: "2vh",
        background: "transparent",
      }}
    >
      <Stack
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
        }}
      >
        <CardActionArea
          component={Link}
          to={{ pathname: "/editor", state: { shader } }}
        >
          <Stack
            direction="row"
            spacing={5}
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
              style={{ paddingTop: "8.5vh", fontWeight: "lighter" }}
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
                const shaderWithCode = await getShaderCode(shader);
                console.log(shaderWithCode);
                if (checked) {
                  console.log("here");
                  success = await makeShaderPublic(shaderWithCode);
                  console.log("set");
                } else {
                  success = await makeShaderPrivate(shaderWithCode);
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
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <ConfirmDeleteDialog
            title={shader.title}
            dialogOpen={deleteDialogOpen}
            setDialogOpen={(open) => {
              setDeleteDialogOpen(open);
            }}
            doDelete={async () => {
              const success = await deleteShader(shader);
              if (success) {
                removeCard();
              }
            }}
          />
        </Stack>
      </Stack>
    </Card>
  );
};

export default UserShaderCard;
