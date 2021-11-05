import { NonFetchedShader } from "../objects/Shader";
import { ShaderCard } from "../components/ShaderCard";
import Typography from "@mui/material/Typography";
import "../assets/cardCarousel.css";

interface CarouselProps {
  sectionName: string;
  shaderList: NonFetchedShader[];
}

export const CardCarousel = ({ sectionName, shaderList }: CarouselProps) => {
  return (
    <div className="row">
      {/* title */}
      <Typography variant="h4" className="title">
        {sectionName}
      </Typography>
      {/* container -> posters */}
      <div className="row__blocks">
        {/* several row posters */}
        {shaderList.map((shader: NonFetchedShader) => (
          <li className="row__tile">
            <ShaderCard shader={shader} />
          </li>
        ))}
      </div>
    </div>
  );
};
