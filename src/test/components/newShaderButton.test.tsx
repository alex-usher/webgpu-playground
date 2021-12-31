import assert from "assert";

import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import NewShaderButton from "../../components/NewShaderButton";
import { MeshType } from "../../objects/Shader";

describe("Shader Card component tests", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <NewShaderButton />
      </BrowserRouter>
    );
  });

  it("brings up a form to pick the mesh type on click", async () => {
    const buttons = screen.getAllByRole("button");
    assert(buttons.length > 0);

    const button = buttons[0] as HTMLButtonElement;
    await button.click();

    assert(screen.getAllByRole("dialog").length == 1);
  });

  it("changes the value of the selected mesh type when radio buttons are clicked", async () => {
    await screen.getAllByRole("button")[0].click();

    const radioButtons = screen.getAllByRole("radio");
    // check that there is the correct number of radio buttons
    assert(Object.keys(MeshType).length == radioButtons.length);

    const firstButton = radioButtons[0] as HTMLInputElement;
    await firstButton.click();
    expect(firstButton.checked).toBeTruthy();
  });
});
