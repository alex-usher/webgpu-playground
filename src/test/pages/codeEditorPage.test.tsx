import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import CodeEditorPage from "../../pages/CodeEditorPage";
import { SnackbarProvider } from "notistack";
import { Shader } from "../../objects/Shader";
import * as shaders from "../../render";
import { v4 as uuidv4 } from "uuid";
import { BrowserRouter } from "react-router-dom";

import "@testing-library/jest-dom/extend-expect";

const renderCodeEditorPage = () =>
  render(
    <SnackbarProvider>
      <BrowserRouter>
        <CodeEditorPage
          shader={
            new Shader(
              uuidv4() + "example_triangle_shader",
              "test",
              "http://www.test.com",
              false,
              shaders.shaderTriangleVertex,
              shaders.shaderTriangleFragment
            )
          }
        />
      </BrowserRouter>
    </SnackbarProvider>
  );

let checkWebGPUMock: jest.SpyInstance;
let simpleShaderMock: jest.SpyInstance;

// helper constants defining the button texts and ids
const SHOW_CODE_ID = "show-code-button";
const COMPILE_ID = "compile-button";
const VERTEX_EDITOR_CLASS = "vertex-editor";
const FRAGMENT_EDITOR_CLASS = "fragment-editor";
const SHOW_CODE_TEXT = "View Code";
const HIDE_CODE_TEXT = "Hide Code";

const doMocks = () => {
  checkWebGPUMock = jest.spyOn(shaders, "checkWebGPU");
  checkWebGPUMock.mockImplementation(() => true);
  simpleShaderMock = jest.spyOn(shaders, "renderShader");
  simpleShaderMock.mockImplementation(() => {
    return;
  });
};

describe("Default render tests", () => {
  beforeEach(() => {
    doMocks();
    renderCodeEditorPage();
  });

  afterEach(jest.resetAllMocks);

  test("By default the fragment editor is not rendered", () => {
    const fragmentEditorDiv = document.querySelector(
      `.${FRAGMENT_EDITOR_CLASS}`
    );
    expect(fragmentEditorDiv?.hasChildNodes()).toBeFalsy();
  });

  test("By default the vertex editor is not rendered", () => {
    const vertexEditorDiv = document.querySelector(`.${VERTEX_EDITOR_CLASS}`);
    expect(vertexEditorDiv?.hasChildNodes()).toBeFalsy();
  });
});

describe("Button Click Tests", () => {
  let showCodeButton: HTMLElement | null;

  beforeEach(() => {
    doMocks();
    renderCodeEditorPage();
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

  test("Clicking the show code button displays the vertex and fragment editor", () => {
    showCodeButton?.click();
    const fragmentEditorDiv = document.querySelector(
      `.${FRAGMENT_EDITOR_CLASS}`
    );
    expect(fragmentEditorDiv?.hasChildNodes()).toBeTruthy();
    const vertexEditorDiv = document.querySelector(`.${VERTEX_EDITOR_CLASS}`);
    expect(vertexEditorDiv?.hasChildNodes()).toBeTruthy();

    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    expect(textAreas.length).toBe(3); // contains shader name textbox, vertex editor and fragment editor
    expect(textAreas[0]).toBeInTheDocument();
    expect(textAreas[1]).toBeInTheDocument();
    expect(textAreas[1]).toBeInTheDocument();
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
  let vertexEditor: HTMLElement | null;
  let fragmentEditor: HTMLElement | null;

  beforeEach(() => {
    doMocks();
    renderCodeEditorPage();

    document.getElementById(SHOW_CODE_ID)?.click();
    const textAreas: HTMLElement[] = screen.getAllByRole("textbox");
    vertexEditor = textAreas[1];
    fragmentEditor = textAreas[2];
  });

  afterEach(() => {
    jest.resetAllMocks();

    vertexEditor = null;
    fragmentEditor = null;
  });

  test("Typing into the vertex code editor updates its text content", () => {
    if (vertexEditor) {
      expect(vertexEditor.textContent).toEqual(shaders.shaderTriangleVertex);
      userEvent.type(vertexEditor, "a");
      expect(vertexEditor.textContent).toEqual(
        `${shaders.shaderTriangleVertex}a`
      );
    } else {
      fail("Vertex editor null");
    }
  });

  test("Typing into the fragment code editor updates its text content", () => {
    if (fragmentEditor) {
      expect(fragmentEditor.textContent).toEqual(
        shaders.shaderTriangleFragment
      );
      userEvent.type(fragmentEditor, "a");
      expect(fragmentEditor.textContent).toEqual(
        `${shaders.shaderTriangleFragment}a`
      );
    } else {
      fail("Fragment editor null");
    }
  });
});
