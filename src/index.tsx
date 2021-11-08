import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CodeEditorPage from "./pages/CodeEditorPage";
import UserPage from "./pages/UserPage";
import { SnackbarProvider } from "notistack";

import "./assets/style.css";

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={1}>
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
          </Switch>
        </Router>
      </div>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
