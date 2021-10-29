import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import HomePage from './pages/HomePage'
import CodeEditorPage from './pages/CodeEditorPage'
import {SnackbarProvider} from 'notistack'

import "./assets/style.css"
import {defaultShader} from "./objects/Shader";

ReactDOM.render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={1}>
            <div id="body">
                <Router>
                    <Switch>
                        <Route path="/" exact>
                            <HomePage/>
                        </Route>
                        <Route path="/editor">
                            <CodeEditorPage shader={defaultShader}/>
                        </Route>
                    </Switch>
                </Router>
            </div>
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
