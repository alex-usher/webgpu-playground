import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ShaderCard } from "../../components/ShaderCard";
import { defaultShader } from "../../objects/Shader";

let container: HTMLElement;

const renderShaderCard = () =>
  render(
    <BrowserRouter>
      <ShaderCard shader={defaultShader} />
    </BrowserRouter>
  );

describe("Shader Card Tests", () => {
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
  });
  it("should render with the given image", () => {
    renderShaderCard();
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", defaultShader.image);
  });
});
