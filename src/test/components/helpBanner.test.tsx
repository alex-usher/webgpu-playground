import { render, screen } from "@testing-library/react";

import { HelpBanner } from "../../components/HelpBanner";

const toggleVisibility = jest.fn(() => {
  undefined;
});
let closeBannerButton: HTMLButtonElement;
describe("Help Banner component tests", () => {
  beforeEach(() => {
    render(<HelpBanner toggleVisibility={toggleVisibility} />);
    closeBannerButton = screen.getAllByRole("button")[0] as HTMLButtonElement;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("On close button press, visibility should be toggled", () => {
    closeBannerButton.click();
    expect(toggleVisibility).toHaveBeenCalledTimes(1);
  });
});
