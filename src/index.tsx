import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CodeEditorPage from "./pages/CodeEditorPage";
import UserPage from "./pages/UserPage";
import ShadersPage from "./pages/ShadersPage";
import { SnackbarProvider } from "notistack";
import { SnackbarUtilsConfigurator } from "./utils/Snackbar";

import "./assets/style.css";

ReactDOM.render(
  <React.StrictMode>
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
  </React.StrictMode>,
  document.getElementById("root")
);
