import "@testing-library/jest-dom/extend-expect";

import assert from "assert";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "notistack";
import routeData from "react-router";
import { BrowserRouter } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { MeshType, Shader } from "../../objects/Shader";
import CodeEditorPage from "../../pages/CodeEditorPage";
import * as helpers from "../../webgpu/pipelines/helpers";
import * as renders from "../../webgpu/pipelines/render";
import * as shaders from "../../webgpu/shaders";

const shader = new Shader(
  uuidv4() + "example_triangle_shader",
  "test",
  "http://www.test.com",
  false,
  `${shaders.rectangleVertex}\n${shaders.rectangleFragment}`,
  MeshType.RECTANGLE
);

const renderCodeEditorPage = async () => {
  render(
    <SnackbarProvider>
      <BrowserRouter>
        <CodeEditorPage />
      </BrowserRouter>
    </SnackbarProvider>
  );
};

let checkWebGPUMock: jest.SpyInstance;
let simpleShaderMock: jest.SpyInstance;

// helper constants defining the button texts and ids
const SHOW_CODE_ID = "show-code-button";
const HELP_ID = "help-button";
const SAVE_ID = "save-button";
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

  checkWebGPUMock = jest.spyOn(helpers, "checkWebGPU");
  checkWebGPUMock.mockImplementation(() => true);
  simpleShaderMock = jest.spyOn(renders, "renderShader");
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

  test("Clicking the show code button displays the save button", () => {
    if (showCodeButton) {
      showCodeButton.click();
      expect(document.getElementById(SAVE_ID)).toBeInTheDocument();
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
    expect(textAreas[1]).toBeInTheDocument();
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

    test("Typing into the code editor updates its text content", async () => {
      if (codeEditor) {
        expect(codeEditor.textContent).toEqual(
          `${shaders.rectangleVertex}\n${shaders.rectangleFragment}`
        );

        await userEvent.type(codeEditor, "a");

        expect(codeEditor.textContent).toEqual(
          `${shaders.rectangleVertex}\n${shaders.rectangleFragment}a`
        );
      } else {
        fail("Vertex editor null");
      }
    });

    it("Typing into the code editor results in calling the WebGPU render function", async () => {
      expect(simpleShaderMock).toHaveBeenCalled();
      if (codeEditor) {
        await userEvent.type(codeEditor, "a");
        expect(checkWebGPUMock).toHaveBeenCalled();
        expect(simpleShaderMock).toHaveBeenCalled();
      }
    });
  });
});

describe("Help banner tests", () => {
  let helpButton: HTMLElement | null;
  let showCodeButton: HTMLElement | null;
  let codeActionsDrawer: HTMLElement | null;
  beforeEach(async () => {
    doMocks();
    await renderCodeEditorPage();
    codeActionsDrawer = document.getElementById("editor-action-dropdown");
    codeActionsDrawer?.click();
    helpButton = document.getElementById(HELP_ID);
    showCodeButton = document.getElementById(SHOW_CODE_ID);
    showCodeButton?.click();
  });

  afterEach(() => {
    jest.resetAllMocks();
    helpButton = null;
  });

  test("Clicking the help button displays the help banner", () => {
    assert(codeActionsDrawer);
    assert(helpButton);
    helpButton?.click();
    const codeEditorDiv = document.getElementsByClassName("help-card")[0];
    assert(codeEditorDiv);
    expect(codeEditorDiv?.hasChildNodes).toBeTruthy();
  });

  test("Clicking the help button twice hides the help banner", () => {
    assert(codeActionsDrawer);
    assert(helpButton);
    helpButton?.click();
    helpButton?.click();
    const codeEditorDiv = document.getElementById("help-card");
    expect(codeEditorDiv?.hasChildNodes).toBeFalsy();
  });
});
