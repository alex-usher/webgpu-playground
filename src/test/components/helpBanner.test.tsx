import { render, screen } from "@testing-library/react";

import { HelpBanner } from "../../components/HelpBanner";

const renderHelpBanner = (toggleVisibility: () => void) =>
  render(<HelpBanner toggleVisibility={toggleVisibility} />);

const toggleVisibility = jest.fn(() => {
  undefined;
});
let closeBannerButton: HTMLButtonElement;
describe("Help Banner component tests", () => {
  beforeEach(() => {
    renderHelpBanner(toggleVisibility);
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
