import { render } from "@testing-library/react";

import Editor from "../../components/Editor";

const testValue = "Test Value";
const renderEditor = () =>
  render(
    <Editor
      value={testValue}
      onChange={() => {
        undefined;
      }}
    />
  );

let editorArea: HTMLTextAreaElement;
describe("Editor Component Tests", () => {
  beforeEach(() => {
    editorArea = renderEditor().container.getElementsByTagName(
      "textarea"
    )[0] as HTMLTextAreaElement;
  });

  test("It should initialise the text area with the given value", () => {
    expect(editorArea.value).toEqual(testValue);
  });
});
