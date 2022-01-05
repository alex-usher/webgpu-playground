import { render } from "@testing-library/react";

import Editor from "../../components/Editor";

import {
  applyCtrlSlash,
  applyShiftTab,
  insertEnter,
  insertTab,
} from "../../utils/textareaActions";


const testValue = "function\n{\n\tbody\n}\n";
const renderEditor = () =>
  render(
    <Editor
      value={testValue}
      onChange={() => {
        undefined;
      }}
    />
  );


let textarea: HTMLTextAreaElement;
describe("Code shortcut string processing tests", () => {

  beforeEach(() => {
    textarea = renderEditor().container.getElementsByTagName(
      "textarea"
    )[0] as HTMLTextAreaElement;
  });

  test("Ctrl + / should toggle comments for a single line", () => {
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    console.log(textarea.value);
    applyCtrlSlash(textarea);
    console.log(textarea.value);
    expect(textarea.value).toEqual("// " + testValue);
  });

  test("Ctrl + / should comment multiple lines iff no lines in thhe selection start with a comment", () => {

  });

  test("Ctrl + / should only uncomment multiple lines iff all lines in the selection start with a comment", () => {

  });

  test("Tabbing a 0 length selection always inserts", () => {

  });

  test("Tabbing a single line selection replaces selection", () => {

  });

  test("Tabbing a multi line selection adds tabs at the start of every line", () => {

  });

  test("Shift + Tab always removes a tab from the start of a line in every selection", () => {

  });

  test("Enter auto indents the next line ", () => {

  });

  test("Two spaces are treated the same as 1 tab", () => {

  });
});