import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { Link } from "react-router-dom"

const ShaderCard = () => {
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined">
          <CardActionArea
            component={Link}
            to="/editor"
            className="shader-card"
            style={{ height: "20%", background: "#4F5358", color: "white" }}
          >
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
    );
  };

  export default ShaderCard