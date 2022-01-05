import { render, fireEvent, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import UserShaderCard from "../../components/UserShaderCard";
import { defaultShader } from "../sample_shaders/defaultShader";


const setDeleteDialogOpen = jest.fn(() => {
  undefined;
});

let publicToggle: HTMLInputElement;
let deleteButton: HTMLButtonElement;
describe("User shader card tests", () => {

  beforeEach(async () => {
    const { findByRole } = render(
      <BrowserRouter>
        <UserShaderCard shader={defaultShader} isPublic={false} />
      </BrowserRouter>
    );
    publicToggle = await findByRole("checkbox");
    deleteButton = await findByRole("button") as HTMLButtonElement;

  });

  test("Toggling the public/private toggle calls the firebase function", () => {
    console.log(publicToggle);
    publicToggle.click;

  });

  test("Pressing delete opens the dialog", async () => {
    deleteButton.click();
    // passes if the dialog has been rendered, fails if times out
    await screen.getByText(/Are you sure you want to delete/i);
  });
});