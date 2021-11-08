import { Shader } from "../objects/Shader";
import { ShaderCard } from "./ShaderCard";
import Typography from "@mui/material/Typography";
import "../assets/cardCarousel.css";

interface CarouselProps {
  sectionName: string;
  shaderList: Shader[];
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
        {shaderList.map((shader) => (
          <li key={shader.id} className="row__tile">
            <ShaderCard shader={shader} />
          </li>
        ))}
      </div>
    </div>
  );
};
