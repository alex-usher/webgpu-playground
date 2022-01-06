import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import UserShaderCard from "../../components/UserShaderCard";
import { defaultShader } from "../sample_shaders/defaultShader";

let publicToggle: HTMLInputElement;
let deleteButton: HTMLButtonElement;
describe("User shader card tests", () => {
  beforeEach(async () => {
    defaultShader.isPublic = false;
    const { findByRole } = render(
      <BrowserRouter>
        <UserShaderCard shader={defaultShader} isPublic={false} />
      </BrowserRouter>
    );
    publicToggle = (await findByRole("checkbox")) as HTMLInputElement;
    deleteButton = (await findByRole("button")) as HTMLButtonElement;
  });

  test("Toggling when private opens the warning dialog", () => {
    publicToggle.click();
    expect(publicToggle.checked);
  });

  test("Toggling when public tries to make the shader private", async () => {
    defaultShader.isPublic = true;
    const { findAllByRole } = render(
      <BrowserRouter>
        <UserShaderCard shader={defaultShader} isPublic={true} />
      </BrowserRouter>
    );
    publicToggle = (await findAllByRole("checkbox"))[1] as HTMLInputElement;

    publicToggle.click();
    expect(!publicToggle.checked);
  });

  test("Pressing delete opens the dialog", async () => {
    deleteButton.click();
    // passes if the dialog has been rendered, fails if times out
    await screen.getByText(/Are you sure you want to delete/i);
  });
});
