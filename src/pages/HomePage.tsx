import React from 'react'
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from "@mui/material/CardContent"
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
                <Grid container spacing={2} style={{paddingTop: "100px"}}> 
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
            <Card>
                <CardActionArea 
                    style={{height: "200px", background:"Grey"}}
                    component={Link} to="/shader"
                >
                    <CardContent>
                        <Typography variant="h4" align="center">
                            triangle 
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    )
}

export default HomePage