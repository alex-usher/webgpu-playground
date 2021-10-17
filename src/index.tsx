import React from 'react'
import ReactDOM from 'react-dom'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
  
import HomePage from './pages/HomePage'
import ShaderCanvas from './components/ShaderCanvas'
import "./assets/style.css"

ReactDOM.render(
    <React.StrictMode>
        <div id="body">
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <HomePage />
                    </Route>
                    <Route path="/shader">
                        <ShaderCanvas />
                    </Route>
                </Switch>
            </Router>
            
        </div>
    </React.StrictMode>,
    document.getElementById('root')
);
