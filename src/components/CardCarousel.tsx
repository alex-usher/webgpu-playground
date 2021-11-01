import { Shader } from "../objects/Shader"
import { ShaderCard } from "../components/ShaderCard"
//import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import "../assets/cardCarousel.css"

interface CarouselProps {
    sectionName: string
    shaderList: Shader[]
}

enum Direction {
    Left,
    Right,
  }

export const CardCarousel = ({ sectionName, shaderList }: CarouselProps) => {
    function handleNav(direction: Direction) {
        switch(direction) {
            case Direction.Left: {
                break;
            }
            case Direction.Right: {
                break;
            }
            default: {
                throw new TypeError(); 
                // It's a type error because it should be impossible
            }
        }
    }


    return (
        <div className="row" >
            {/* title */}
            <Typography variant="h2">
                {sectionName}
            </Typography>
            <Button variant="outlined" onClick={() => handleNav(Direction.Left)} >
                    New Shader Sandbox
            </Button>
            {/* container -> posters */}
            <div className="row__blocks">
                {/* several row posters */}
                {shaderList.map((shader) => (
                   <li className="row__poster row__posterLarge"><ShaderCard shader={shader}/> </li>
                ))}
            </div>
            <Button variant="outlined" onClick={() => handleNav(Direction.Right)} >
                    New Shader Sandbox
                    </Button>
      </div >)
}