import "../assets/style.css";
import "../assets/codeEditorPage.css";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { TabContext } from "@mui/lab";
import TabPanel from "@mui/lab/TabPanel";
import { Tab, Tabs } from "@mui/material";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import ActionsDrawer from "../components/ActionsDrawer";
import CodeEditor from "../components/CodeEditor";
import FormDialog from "../components/FormDialog";
import ShaderCanvas from "../components/ShaderCanvas";
import SignInButton from "../components/SignInButton";
import { auth } from "../firebase";
import { RenderLogger } from "../objects/RenderLogger";
import { Shader, defaultShader } from "../objects/Shader";
import { MeshType } from "../objects/Shader";
import {
  getShaderCode,
  isCurrentUsersShader,
  overwriteShader,
} from "../utils/firebaseHelper";
import KeyboardShortcut from "../utils/keyboardShortcuts";
import { addShortcuts } from "../utils/shortcutListener";

// Shortcut patterns
const altT = new KeyboardShortcut("T", false, false, true);
const altH = new KeyboardShortcut("H", false, false, true);
const altA = new KeyboardShortcut("A", false, false, true);
const ctrlS = new KeyboardShortcut("S", false, true);
const ctrlE = new KeyboardShortcut("E", false, true);

const CodeEditorPage = () => {
  const state = useLocation().state as {
    shader: Shader;
    meshType: MeshType;
  };
  const isLoadedShader = state.shader;
  // TODO - this has a default for now but in the future this should never be empty
  // Firebase should always save the type of mesh a shader uses
  const meshType = state.meshType ? state.meshType : isLoadedShader.meshType;

  // Get the loaded shader code if is a loaded shader, else get the default corresponding to the mesh
  const [shader, setShader] = useState<Shader>(
    isLoadedShader
      ? (useLocation().state as { shader: Shader }).shader
      : defaultShader(meshType)
  );

  const showCodeRef = useRef(false);
  const helpBoxVisibleRef = useRef(false);
  const saveFormOpenRef = useRef(false);
  const actionsDrawerOpenRef = useRef(false);
  const editorWidthRef = useRef("100%");

  const [editorWidth, setEditorWidth] = useState(editorWidthRef.current);
  const [editorOpacity, setEditorOpacity] = useState(0.5);
  const [helpBoxVisible, setHelpBoxVisible] = useState(
    helpBoxVisibleRef.current
  );
  const [actionsDrawerOpen, setActionsDrawerOpen] = useState(
    actionsDrawerOpenRef.current
  );
  const [inFullscreen, setInFullscreen] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState(shader.imageUrl);
  const [saveFormOpen, setSaveFormOpen] = useState(saveFormOpenRef.current);
  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [renderLogger, setRenderLogger] = useState(new RenderLogger());
  const [shaderCode, setShaderCode] = useState(shader.shaderCode);
  const [shaderName, setShaderName] = useState("Untitled " + meshType);
  const [showCode, setShowCode] = useState(false);
  const [viewCodeText, setViewCodeText] = useState("View Code");
  const [currTab, setCurrTab] = useState("0");
  // states for custom buffers
  const [vertexBuffer, setVertexBuffer] = useState(shader.vertexBuffer);
  const [colourBuffer, setColourBuffer] = useState(shader.colourBuffer);
  const [numberOfVertices, setNumberOfVertices] = useState(
    shader.numberOfVertices.toString()
  );

  const history = useHistory();

  useEffect(() => {
    const shortcuts = [
      {
        shortcut: altT,
        action: () => {
          toggleShowCode();
        },
      },
      {
        shortcut: altH,
        action: () => {
          toggleHelpVisible();
        },
      },
      {
        shortcut: altA,
        action: () => {
          toggleActionDrawer();
        },
      },
      {
        shortcut: ctrlS,
        action: async () => {
          await handleFormOpen();
        },
      },
      {
        shortcut: ctrlE,
        action: () => {
          exportAsPng();
        },
      },
    ];
    addShortcuts("*", shortcuts);
  }, []);

  useEffect(() => {
    shader.shaderCode = shaderCode;
  }, [shaderCode]);

  useEffect(() => {
    if (shader.shaderCode === "") {
      getShaderCode(shader).then((shaderWithCode: Shader) => {
        setShader(shaderWithCode);
        setShaderCode(shader.shaderCode);
        setVertexBuffer(shader.vertexBuffer);
        setColourBuffer(shader.colourBuffer);
        setNumberOfVertices(shader.numberOfVertices.toString());
        setRenderedImageUrl(shader.imageUrl);
        // Only set the name if getting an existing shader - new shaders will display "untitled"
        setShaderName(shader.title);
      });
    }
  }, []);

  useEffect(() => {
    shader.shaderCode = shaderCode;
    shader.vertexBuffer = vertexBuffer;
    shader.colourBuffer = colourBuffer;
    shader.numberOfVertices = numberOfVertices;
    shader.imageUrl = renderedImageUrl;
  }, [
    shaderCode,
    vertexBuffer,
    colourBuffer,
    numberOfVertices,
    renderedImageUrl,
  ]);

  const toggleActionDrawer = () => {
    // Only allow the drawer to open if the code actions button is available
    actionsDrawerOpenRef.current = !actionsDrawerOpenRef.current;
    setActionsDrawerOpen(actionsDrawerOpenRef.current);
  };

  const exportAsPng = () => {
    const canvas = document.getElementById(
      "canvas-webgpu"
    ) as HTMLCanvasElement;
    const link = document.createElement("a");
    link.download = "shader.png";

    canvas.toBlob(function (blob) {
      link.href = URL.createObjectURL(blob);
      link.click();
    }, "image/png");
  };

  const handleFormOpen = async () => {
    if (!auth.currentUser) {
      setLoginFormOpen(true);
    } else if ((await isCurrentUsersShader(shader)) && shader.id) {
      overwriteShader(shader);
    } else {
      saveFormOpenRef.current = true;
      setSaveFormOpen(saveFormOpenRef.current);
    }
  };

  const handleFormClose = () => {
    setShaderName(shader.title);
    saveFormOpenRef.current = false;
    setSaveFormOpen(saveFormOpenRef.current);
    setLoginFormOpen(false);
  };

  const toggleShowCode = () => {
    showCodeRef.current = !showCodeRef.current;
    setShowCode(showCodeRef.current);
    setViewCodeText(showCode ? "View Code" : "Hide Code");
  };

  const toggleHelpVisible = () => {
    helpBoxVisibleRef.current = !helpBoxVisibleRef.current;
    setHelpBoxVisible(helpBoxVisibleRef.current);
    {
      !helpBoxVisibleRef.current
        ? (editorWidthRef.current = "100%")
        : (editorWidthRef.current = "75%");
    }
    setEditorWidth(editorWidthRef.current);
  };

  return (
    <div id="body">
      <div className="paddedDiv">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid
            container
            direction="row"
            spacing={2}
            style={{ minWidth: "55%", maxWidth: "55%" }}
            alignItems="center"
          >
            <Grid item>
              <Button
                id="home-button"
                variant="outlined"
                disableElevation
                onClick={() => {
                  history.goBack();
                }}
                color="primary"
                startIcon={<ArrowBackIcon />}
              >
                {"Back"}
              </Button>
            </Grid>
            <Grid item>
              <Button
                id="show-code-button"
                variant="outlined"
                disableElevation
                onClick={toggleShowCode}
                color={"primary"}
              >
                {viewCodeText}
              </Button>
            </Grid>
            {showCode && (
              <>
                <Grid item>
                  <Button
                    key="save-button"
                    id="save-button"
                    variant="outlined"
                    disableElevation
                    fullWidth
                    color="success"
                    onClick={handleFormOpen}
                  >
                    Save
                  </Button>
                </Grid>
                {meshType === MeshType.CUSTOM ? (
                  <Grid item>
                    <div className="tabs">
                      <Tabs
                        value={currTab}
                        onChange={(e, newTab: string) => setCurrTab(newTab)}
                      >
                        <Tab label="main" value="0" />
                        <Tab label="vertices" value="1" />
                        <Tab label="colours" value="2" />
                        <Tab label="vertex no" value="3" />
                      </Tabs>
                    </div>
                  </Grid>
                ) : (
                  <></>
                )}
              </>
            )}
          </Grid>

          <Dialog open={loginFormOpen} onClose={handleFormClose}>
            <DialogTitle>Sign in to save a shader</DialogTitle>
            <DialogContent
              style={{ display: "flex", justifyContent: "center" }}
            >
              <SignInButton />
            </DialogContent>
          </Dialog>
          <FormDialog
            key="save-form"
            open={saveFormOpen}
            handleClose={handleFormClose}
            shaderCode={shaderCode}
            updateShader={(shader) => setShader(shader)}
            meshType={shader.meshType}
            vertexBuffer={vertexBuffer}
            colourBuffer={colourBuffer}
            numberOfVertices={numberOfVertices}
            imageUrl={renderedImageUrl}
          />

          <Grid container direction="row" justifyContent="flex-end">
            <Grid item>
              <Typography
                variant="h5"
                style={{
                  color: "lightGrey",
                  fontSize: "3vh",
                  fontStyle: "italic",
                }}
              >
                {shaderName}
              </Typography>
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Grid item>
              <IconButton
                color="primary"
                style={{ fontSize: "3vh", paddingRight: "2vh" }}
                onClick={() => {
                  setInFullscreen(!inFullscreen);
                  if (!inFullscreen) {
                    const wholePage = document.documentElement;
                    wholePage.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
              >
                {inFullscreen ? (
                  <FullscreenExitIcon fontSize="inherit" />
                ) : (
                  <FullscreenIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
            <ActionsDrawer
              toggleHelpVisible={toggleHelpVisible}
              toggleActionsDrawerVisible={toggleActionDrawer}
              actionsDrawerVisible={actionsDrawerOpen}
              editorOpacity={editorOpacity}
              setEditorOpacity={setEditorOpacity}
              shader={shader}
              shaderName={shaderName}
              meshType={meshType}
              setRenderedImageUrl={setRenderedImageUrl}
            />
          </Grid>
        </Stack>
      </div>

      <ShaderCanvas
        shaderCode={shaderCode}
        meshType={meshType}
        setRenderLogger={setRenderLogger}
        vertexBuffer={vertexBuffer}
        colourBuffer={colourBuffer}
        numberOfVertices={numberOfVertices}
        imageUrl={renderedImageUrl}
      />

      {showCode ? (
        meshType === MeshType.CUSTOM ? (
          <TabContext value={currTab}>
            <TabPanel value="0">
              <CodeEditor
                helpBoxVisible={helpBoxVisible}
                toggleHelpVisible={toggleHelpVisible}
                editorOpacity={editorOpacity}
                editorWidth={editorWidth}
                code={shaderCode}
                setCode={setShaderCode}
                renderLogger={renderLogger}
              />
            </TabPanel>
            <TabPanel value="1">
              <CodeEditor
                helpBoxVisible={helpBoxVisible}
                toggleHelpVisible={toggleHelpVisible}
                editorOpacity={editorOpacity}
                editorWidth={editorWidth}
                code={vertexBuffer}
                setCode={setVertexBuffer}
                renderLogger={renderLogger}
              />
            </TabPanel>
            <TabPanel value="2">
              <CodeEditor
                helpBoxVisible={helpBoxVisible}
                toggleHelpVisible={toggleHelpVisible}
                editorOpacity={editorOpacity}
                editorWidth={editorWidth}
                code={colourBuffer}
                setCode={setColourBuffer}
                renderLogger={renderLogger}
              />
            </TabPanel>
            <TabPanel value="3">
              <CodeEditor
                helpBoxVisible={helpBoxVisible}
                toggleHelpVisible={toggleHelpVisible}
                editorOpacity={editorOpacity}
                editorWidth={editorWidth}
                code={numberOfVertices}
                setCode={setNumberOfVertices}
                renderLogger={renderLogger}
              />
            </TabPanel>
          </TabContext>
        ) : (
          <CodeEditor
            helpBoxVisible={helpBoxVisible}
            toggleHelpVisible={toggleHelpVisible}
            editorOpacity={editorOpacity}
            editorWidth={editorWidth}
            code={shaderCode}
            setCode={setShaderCode}
            renderLogger={renderLogger}
          />
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default CodeEditorPage;
