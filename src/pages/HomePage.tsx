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
                    <Grid item xs={12} md={6}>
                        <Typography variant="h3" style={{color: "white"}}>
                            WebGPU Playground
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button variant="outlined" disableElevation component={Link} to="/editor"> 
                            New Shader Sandbox
                        </Button>
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
        <Grid item xs={12} md={4}>
            <Card variant="outlined">
                <CardActionArea 
                    style={{height: "310px", background:"Grey"}}
                    component={Link} to="/editor"
                >
                    <CardMedia
                        style={{height: 240, objectFit: "cover"}}
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