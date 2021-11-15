import userEvent from "@testing-library/user-event";
import { act, render, screen } from "@testing-library/react";
import CodeEditorPage from "../../pages/CodeEditorPage";
import { SnackbarProvider } from "notistack";
import { Shader } from "../../objects/Shader";
import * as shaders from "../../render";
import { v4 as uuidv4 } from "uuid";
import routeData from "react-router";
import { BrowserRouter } from "react-router-dom";

import "@testing-library/jest-dom/extend-expect";

const shader = new Shader(
  uuidv4() + "example_triangle_shader",
  "test",
  "http://www.test.com",
  false,
  `${shaders.rectangleVertex}\n${shaders.rectangleFragment}`
);

const renderCodeEditorPage = async () =>
  await act(async () => {
    render(
      <SnackbarProvider>
        <BrowserRouter>
          {/* TODO - atm if we change the default shader the tests will fail - fix by setting any references to the shader to the new deafeult */}
          {/* as we are using locations, to properly test this we should fix properly by setting the location to default shader in the test */}
          {/* https://dev.to/wolverineks/react-router-testing-location-state-33fo */}
          <CodeEditorPage />
        </BrowserRouter>
      </SnackbarProvider>
    );
  });

let checkWebGPUMock: jest.SpyInstance;
let simpleShaderMock: jest.SpyInstance;

// helper constants defining the button texts and ids
const SHOW_CODE_ID = "show-code-button";
const COMPILE_ID = "compile-button";
const EDITOR_CLASS = "editors";
const SHOW_CODE_TEXT = "View Code";
const HIDE_CODE_TEXT = "Hide Code";

const mockLocation = {
  pathname: "/editor",
  hash: "",
  search: "",
  state: { shader },
};

const doMocks = () => {
  jest.spyOn(routeData, "useLocation").mockReturnValue(mockLocation);

  checkWebGPUMock = jest.spyOn(shaders, "checkWebGPU");
  checkWebGPUMock.mockImplementation(() => true);
  simpleShaderMock = jest.spyOn(shaders, "renderShader");
  simpleShaderMock.mockImplementation(() => {
    return new Promise((resolve) => {
      resolve("");
    });
  });
};

describe("Default render tests", () => {
  beforeEach(async () => {
    doMocks();
    await renderCodeEditorPage();
  });

  afterEach(jest.resetAllMocks);

  test("By default the code editor is not rendered", () => {
    const codeEditorDiv = document.querySelector(`.${EDITOR_CLASS}`);
    expect(codeEditorDiv?.hasChildNodes()).toBeFalsy();
  });
});

describe("Button Click Tests", () => {
  let showCodeButton: HTMLElement | null;

  beforeEach(async () => {
    doMocks();
    await renderCodeEditorPage();
    showCodeButton = document.getElementById(SHOW_CODE_ID);
  });

  afterEach(() => {
    jest.resetAllMocks();
    showCodeButton = null;
  });

  test("Clicking the show code button changes its text", () => {
    if (showCodeButton) {
      expect(showCodeButton.textContent).toEqual(SHOW_CODE_TEXT);
      showCodeButton.click();
      expect(showCodeButton.textContent).toEqual(HIDE_CODE_TEXT);
    } else {
      fail("Show code button null");
    }
  });

  test("Clicking the show code button alternates its text", () => {
    if (showCodeButton) {
      expect(showCodeButton.textContent).toEqual(SHOW_CODE_TEXT);
      showCodeButton.click();
      showCodeButton.click();
      expect(showCodeButton.textContent).toEqual(SHOW_CODE_TEXT);
    } else {
      fail("Show code button null");
    }
  });

  test("Clicking the show code button displays the compile button", () => {
    if (showCodeButton) {
      showCodeButton.click();
      expect(document.getElementById(COMPILE_ID)).toBeInTheDocument();
    } else {
      fail("Show code button null");
    }
  });

  test("Clicking the show code button displays the code editor", () => {
    showCodeButton?.click();
    const codeEditorDiv = document.querySelector(`.${EDITOR_CLASS}`);
    expect(codeEditorDiv?.hasChildNodes()).toBeTruthy();

    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    expect(textAreas.length).toBe(2); // contains shader name textbox, vertex editor and fragment editor
    expect(textAreas[0]).toBeInTheDocument();
  });

  test("Clicking the compile code button results in calling the WebGPU render function", () => {
    expect(simpleShaderMock).toHaveBeenCalled();
    showCodeButton?.click();
    const compileCodeButton = document.getElementById(COMPILE_ID);

    compileCodeButton?.click();

    expect(checkWebGPUMock).toHaveBeenCalled();
    expect(simpleShaderMock).toHaveBeenCalled();
  });
});

describe("Code editor tests", () => {
  let codeEditor: HTMLElement | null;

  beforeEach(async () => {
    doMocks();
    await renderCodeEditorPage();

    document.getElementById(SHOW_CODE_ID)?.click();
    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    codeEditor = textAreas[0];
  });

  afterEach(() => {
    jest.resetAllMocks();

    codeEditor = null;
  });

  test("Typing into the code editor updates its text content", () => {
    if (codeEditor) {
      expect(codeEditor.textContent).toEqual(shader.shaderCode);
      console.log(codeEditor.textContent);
      userEvent.type(codeEditor, "a");
      expect(codeEditor.textContent).toEqual(`${shader.shaderCode}a`);
      console.log(codeEditor.textContent);
    } else {
      fail("Vertex editor null");
    }
  });
});
