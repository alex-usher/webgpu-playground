import { Shader } from "../objects/Shader";
import { ShaderCard } from "../components/ShaderCard";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import "../assets/cardCarousel.css";

interface CarouselProps {
  sectionName: string;
  shaderList: Shader[];
  pageLink: string;
}

export const CardCarousel = ({
  sectionName,
  shaderList,
  pageLink,
}: CarouselProps) => {
  return (
    <div className="row">
      <Grid
        item
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        className="header"
      >
        {/* title */}
        <Typography variant="h4" className="title">
          {sectionName}
        </Typography>
        <Button
          variant="outlined"
          disableElevation
          component={Link}
          to={{
            pathname: pageLink,
            state: { sectionName, shaderList },
          }}
        >
          See All
        </Button>
      </Grid>
      {/* container -> posters */}
      <div className="row__blocks">
        {/* several row posters */}
        {shaderList.map((shader) => (
          <li className="row__tile">
            <ShaderCard shader={shader} />
          </li>
        ))}
      </div>
    </div>
  );
};
