import React from 'react'
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";

import "../assets/homePage.css"

class HomePage extends React.Component {
    // constructor(props) {
    //     super(props)
    //     this.state = {
    //         shaders: []
    //     }
    // }

    // componentDidMount() {
    //     // TODO replace with api call to get shaders 
    // }

    render() {
        return (
            <Container> 
                <Grid container spacing={2} style={{paddingTop: "100px"}} alignItems="center" justifyContent="flex-end"> 
                    
                    <Grid 
                        item 
                        container 
                        justifyContent="space-between" 
                        alignItems="center" 
                        spacing={2} 
                        className="title-header"
                    >
                    
                        <Grid item>
                            <Typography variant="h3">
                                WebGPU Playground
                            </Typography>
                        </Grid>
                        <Grid item >
                                <Button variant="outlined" disableElevation component={Link} to="/editor"> 
                                    New Shader Sandbox
                                </Button>
                        </Grid>
                    </Grid>
                    {/* this.state.shaders.map() */}
                    <ShaderCard />
                    <ShaderCard />
                    <ShaderCard />
                </Grid>
            </Container>
        )
    }
}
 

const ShaderCard = () => {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
                <CardActionArea component={Link} to="/editor" className="shader-card" style={{height:"320px", background:"#4F5358",color:"white"}}>
                    <CardMedia
                        className="shader-card-image"
                        component="img"
                        src="https://i.ibb.co/M5Z06wy/triangle.png"
                    />
                    <CardContent>
                        <Typography variant="h4" align="left">
                            Triangle 
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    )
}

export default HomePage