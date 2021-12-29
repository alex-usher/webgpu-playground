import "@testing-library/jest-dom/extend-expect";

import assert from "assert";

import { render, screen } from "@testing-library/react";

import ConsoleOutput from "../../components/ConsoleOutput";

const testMessageSuccess = "Compilation completed successfully";
const VIEW_CONSOLE_TEXT = "View Console";
const HIDE_CONSOLE_TEXT = "Hide Console";

const renderConsoleOutput = () =>
  render(<ConsoleOutput messages={testMessageSuccess} />);

let viewConsoleButton: HTMLButtonElement;
describe("Console Output component tests", () => {
  beforeEach(() => {
    renderConsoleOutput();
    viewConsoleButton = screen.getAllByRole("button")[0] as HTMLButtonElement;
  });

  test("By default the console textarea should be visible", () => {
    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    expect(textAreas.length).toBe(1);
    expect(textAreas[0]).toBeInTheDocument();
  });

  test("The console textarea should display the correct text value", () => {
    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    assert(textAreas.length > 0);
    expect(textAreas[0].textContent).toEqual(testMessageSuccess);
  });

  test("The view console button text should change on click", () => {
    expect(viewConsoleButton.textContent).toEqual(HIDE_CONSOLE_TEXT);
    viewConsoleButton.click();
    expect(viewConsoleButton.textContent).toEqual(VIEW_CONSOLE_TEXT);
  });

  test(`The view console button text should revert to '${HIDE_CONSOLE_TEXT}' after 2 clicks`, () => {
    viewConsoleButton.click();
    expect(viewConsoleButton.textContent).toEqual(VIEW_CONSOLE_TEXT);
    viewConsoleButton.click();
    expect(viewConsoleButton.textContent).toEqual(HIDE_CONSOLE_TEXT);
  });
});
