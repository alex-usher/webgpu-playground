import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
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

interface PublicWarningDialogProps {
  isWarningOpen: boolean;
  setIsWarningOpen: (arg0: boolean) => void;
  doMakePublic: () => void;
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

const PublicWarningDialog = ({
  isWarningOpen,
  setIsWarningOpen,
  doMakePublic,
}: PublicWarningDialogProps) => {
  return (
    <Dialog open={isWarningOpen} onClose={() => setIsWarningOpen(false)}>
      <DialogTitle>Warning</DialogTitle>
      <DialogContent style={{ display: "flex", justifyContent: "center" }}>
        <DialogContentText>
          Publishing your shader will allow other users to save, edit, and
          publically reupload it under their name. You may specify an alternate
          license for your shader, but WebGPUniverse is not responsible for
          upholding the terms of said license.
          <br />
          Click OK to agree with these terms, or cancel to keep your shader
          private.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsWarningOpen(false);
            doMakePublic();
          }}
        >
          OK
        </Button>
        <Button onClick={() => setIsWarningOpen(false)}>cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

function PublicOperationCheck(
  success: boolean,
  checked: boolean,
  setPublicChecked: (arg0: boolean) => void,
  shader: Shader
) {
  if (success) {
    setPublicChecked(checked);
    shader.isPublic = checked;
  } else {
    // Reset the toggle if the operation failed to avoid confusion
    setPublicChecked(!checked);
  }
}

const UserShaderCard = ({
  shader,
  isPublic,
  removeCard,
}: UserShaderCardProps) => {
  const [publicChecked, setPublicChecked] = useState(isPublic);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

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
                if (checked) {
                  setIsWarningOpen(true);
                } else {
                  success = await makeShaderPrivate(shaderWithCode);
                  PublicOperationCheck(
                    success,
                    false,
                    setPublicChecked,
                    shaderWithCode
                  );
                }
              }}
              control={<Switch checked={publicChecked} />}
              labelPlacement="top"
              label={publicChecked ? "Public" : "Private"}
            />
          </FormGroup>
          <PublicWarningDialog
            isWarningOpen={isWarningOpen}
            setIsWarningOpen={setIsWarningOpen}
            doMakePublic={async () => {
              const shaderWithCode = await getShaderCode(shader);
              const success = await makeShaderPublic(shaderWithCode);
              PublicOperationCheck(
                success,
                true,
                setPublicChecked,
                shaderWithCode
              );
            }}
          />

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
