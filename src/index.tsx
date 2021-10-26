import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import HomePage from './pages/HomePage'
import CodeEditorPage from './pages/CodeEditorPage'
import { SnackbarProvider } from 'notistack'

import "./assets/style.css"
import { rectangleFragment, rectangleVertex/*, shaderTriangleFragment, shaderTriangleVertex*/ } from './render';

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
                            <CodeEditorPage defaultVertexCode={rectangleVertex} defaultFragmentCode={rectangleFragment} />
                        </Route>
                    </Switch>
                </Router>
            </div>
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
