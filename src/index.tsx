import "./assets/style.css";

import { ThemeProvider, createTheme } from "@mui/material";
import { green, red, yellow } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import CodeEditorPage from "./pages/CodeEditorPage";
import HomePage from "./pages/HomePage";
import ShadersPage from "./pages/ShadersPage";
import UserPage from "./pages/UserPage";
import { SnackbarUtilsConfigurator } from "./utils/Snackbar";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    error: {
      main: red["A100"],
    },
    warning: {
      main: yellow[200],
    },
    success: {
      main: green[300],
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider maxSnack={1}>
        <SnackbarUtilsConfigurator />
        <div id="body">
          <Router>
            <Switch>
              <Route path="/" exact>
                <HomePage />
              </Route>
              <Route path="/editor">
                <CodeEditorPage />
              </Route>
              <Route path="/user" component={UserPage} />
              <Route path="/examples" component={ShadersPage} />
              <Route path="/public" component={ShadersPage} />
              <Route path="/mypublicshaders" component={ShadersPage} />
              <Route path="/myprivateshaders" component={ShadersPage} />
            </Switch>
          </Router>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
