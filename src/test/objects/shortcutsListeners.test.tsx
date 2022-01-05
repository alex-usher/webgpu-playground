import { render, fireEvent } from "@testing-library/react";

import KeyboardShortcut from "../../utils/keyboardShortcuts";
import { addShortcuts } from "../../utils/shortcutListener";


const renderEditor = () =>
  render(
    <div className="testDiv"></div>
  );

const onMatch = jest.fn(() => {
  undefined;
});

const enter = new KeyboardShortcut("Enter");

let testDiv: HTMLElement;
describe("Shortcut listener framework tests", () => {
  beforeEach(() => {
    testDiv = renderEditor().container.getElementsByTagName("div")[0];
    addShortcuts(".testDiv", [{ shortcut: enter, action: onMatch }]);
  });

  test("When a KeyboardEvent matches a shortcut, call the action exactly once", () => {
    fireEvent.keyDown(
      testDiv,
      {
        key: "Enter",
        code: "Enter"
      }
    );
    expect(onMatch).toHaveBeenCalledTimes(1);
  });
});