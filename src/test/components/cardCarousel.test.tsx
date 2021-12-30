import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { CardCarousel } from "../../components/CardCarousel";
import { Shader, ShaderType, ShaderTypeEnum } from "../../objects/Shader";
import { defaultShader } from "../sample_shaders/defaultShader";

const renderCardCarousel = (
  shaderType: ShaderType,
  shaderList: Shader[],
  pageLength: number
) => {
  return render(
    <BrowserRouter>
      <CardCarousel
        shaderType={shaderType}
        shaderList={shaderList}
        pageLength={pageLength}
      />
    </BrowserRouter>
  );
};

describe("Card Carousel Tests", () => {
  test("It should render the amount of shaders given to it", () => {
    const shaderList: Shader[] = [defaultShader, defaultShader, defaultShader];
    const shaderType: ShaderType = {
      pageLink: "/public",
      sectionName: "public",
      type: ShaderTypeEnum.PUBLIC,
    };

    const { container } = renderCardCarousel(shaderType, shaderList, 3);
    expect(container.getElementsByClassName("row__blocks").length).toBe(1);

    const rowBlocks = container.getElementsByClassName("row__blocks")[0];
    expect(rowBlocks.childNodes.length).toBe(shaderList.length);
  });
});
