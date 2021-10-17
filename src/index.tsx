import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
  
import HomePage from './pages/HomePage'
import ShaderCanvas from './components/ShaderCanvas'

// import {checkWebGPU} from './helper'
//import {renderTriangle} from "./render"

import "./assets/style.css"
import CodeEditorPage from './pages/CodeEditorPage';

// const message = checkWebGPU() ? "hello, triangle!" : "webgpu not supported!"

ReactDOM.render(
    <React.StrictMode>
        <div id="body">
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <HomePage />
                    </Route>
                    <Route path="/users">
                        <ShaderCanvas />
                    </Route>
                    <Route path="/editor">
                        <CodeEditorPage />
                    </Route>
                </Switch>
            </Router>
            
        </div>
    </React.StrictMode>,
    document.getElementById('root')
);

//renderTriangle().then(() => {})