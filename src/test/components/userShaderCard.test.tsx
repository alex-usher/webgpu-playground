import { render, screen, wait } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import UserShaderCard from "../../components/UserShaderCard";
import { defaultShader } from "../sample_shaders/defaultShader";

const setIsWarningOpen = jest.fn(() => {
  undefined;
});

const getShaderCode = jest.fn(() => {
  undefined;
});

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

  test("Toggling when private opens the warning dialog", async () => {
    publicToggle.click();
    // passes if the dialog has been rendered, fails if times out
    expect(publicToggle.checked);
    await wait(() => {
      expect(setIsWarningOpen).toHaveBeenCalledTimes(1);
    });
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
    // passes if the dialog has been rendered, fails if times out
    expect(!publicToggle.checked);
    await wait(() => {
      expect(getShaderCode).toHaveBeenCalledTimes(1);
    });
    //await screen.getByText(/Warning/i);
  });

  test("Pressing delete opens the dialog", async () => {
    deleteButton.click();
    // passes if the dialog has been rendered, fails if times out
    await screen.getByText(/Are you sure you want to delete/i);
  });
});
