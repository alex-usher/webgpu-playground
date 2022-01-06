import { render } from "@testing-library/react";

import Editor from "../../components/Editor";
import {
  applyCtrlSlash,
  applyShiftTab,
  insertEnter,
  insertTab,
  setTextareaState,
} from "../../utils/textareaActions";

const testValue = "f\n{\n\tb\n}\n";
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
    const state = { text: "\n" + testValue, start: 0, end: 0 };
    setTextareaState(state, textarea);
  });

  test("Ctrl + / should toggle comments for a single line", () => {
    const state = { text: "\n" + testValue, start: 1, end: 1 };
    setTextareaState(state, textarea);
    applyCtrlSlash(textarea);
    expect(textarea.value).toEqual("\n// f\n{\n\tb\n}\n");
  });

  test("Ctrl + / should comment multiple lines iff no lines in thhe selection start with a comment", () => {
    const state = { text: "\n" + testValue, start: 1, end: 9 };
    setTextareaState(state, textarea);
    applyCtrlSlash(textarea);
    expect(textarea.value).toEqual("\n// f\n// {\n// \tb\n// }\n");
  });

  test("Ctrl + / should only uncomment multiple lines iff all lines in the selection start with a comment", () => {
    const state = { text: "\n// f\n// {\n// \tb\n// }\n", start: 1, end: 21 };
    setTextareaState(state, textarea);
    applyCtrlSlash(textarea);
    expect(textarea.value).toEqual("\n" + testValue);
  });

  test("Tabbing a 0 length selection always inserts", () => {
    const state = { text: "\nf\n{\n\tb\n}\n", start: 1, end: 1 };
    setTextareaState(state, textarea);
    insertTab(textarea);
    expect(textarea.value).toEqual("\n\tf\n{\n\tb\n}\n");
  });

  test("Tabbing a selection adds tabs at the start of every line", () => {
    const state = { text: "\n" + testValue, start: 1, end: 9 };
    setTextareaState(state, textarea);
    insertTab(textarea);
    expect(textarea.value).toEqual("\n\tf\n\t{\n\t\tb\n\t}\n");
  });

  test("Shift + Tab always removes a tab from the start of a line in every selection", () => {
    const state = { text: "\n\tf\n\t{\n\t\tb\n\t}\n", start: 1, end: 13 };
    setTextareaState(state, textarea);
    applyShiftTab(textarea);
    expect(textarea.value).toEqual("\n" + testValue);
  });

  test("Enter auto indents the next line ", () => {
    const state = { text: "\n" + testValue, start: 4, end: 4 };
    setTextareaState(state, textarea);
    insertEnter(textarea);
    expect(textarea.value).toEqual("\nf\n{\n\t\n\tb\n}\n");
  });
});
