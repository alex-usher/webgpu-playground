import "@testing-library/jest-dom/extend-expect";

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { ShaderCard } from "../../components/ShaderCard";
import { defaultShader } from "../sample_shaders/defaultShader";

const renderShaderCard = () =>
  render(
    <BrowserRouter>
      <ShaderCard shader={defaultShader} />
    </BrowserRouter>
  );

describe("Shader Card component tests", () => {
  beforeEach(() => {
    renderShaderCard();
  });
  it("should display the shader's image", () => {
    const displayedImage = document.querySelector("img") as HTMLImageElement;
    expect(displayedImage.src).toContain(defaultShader.image);
  });

  it("should display the shader's title", () => {
    expect(screen.getByText(defaultShader.title)).toBeInTheDocument();
  });
});
