import "@testing-library/jest-dom/extend-expect";

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormDialog from "../../components/FormDialog";
import { MeshType, Shader } from "../../objects/Shader";
import * as firebaseHelper from "../../utils/firebaseHelper";
import { rectangleNumberOfVertices } from "../../webgpu/meshes/rectangle";
import { shaderTriangleVertex } from "../sample_shaders/triangle";

const defaultShader = new Shader(
  "testid",
  "testfile",
  "testimage",
  false,
  shaderTriangleVertex,
  MeshType.RECTANGLE,
  "",
  "",
  "6",
  "testimageurl.com/image"
);

const renderFormDialog = async (
  open: boolean,
  handleClose: () => void,
  shaderCode: string,
  updateShader: (shader: Shader) => void
) =>
  await act(async () => {
    render(
      <FormDialog
        open={open}
        handleClose={handleClose}
        shaderCode={shaderCode}
        updateShader={updateShader}
        meshType={defaultShader.meshType}
        vertexBuffer={defaultShader.vertexBuffer}
        colourBuffer={defaultShader.colourBuffer}
        numberOfVertices={defaultShader.numberOfVertices}
        imageUrl={defaultShader.imageUrl}
      />
    );
  });

let saveNewShaderMock: jest.SpyInstance;
let handleCloseMock: jest.MockedFunction<() => void>;
let updateShaderMock: jest.MockedFunction<(shader: Shader) => void>;

let buttons: HTMLElement[];
describe("Form Dialog component tests", () => {
  beforeEach(async () => {
    updateShaderMock = jest.fn((_shader) => {
      undefined;
    });

    handleCloseMock = jest.fn(() => {
      undefined;
    });

    saveNewShaderMock = jest.spyOn(firebaseHelper, "saveNewShader");
    saveNewShaderMock.mockImplementation(() => {
      return new Promise((resolve) => resolve(defaultShader));
    });

    await renderFormDialog(
      true,
      handleCloseMock,
      shaderTriangleVertex,
      updateShaderMock
    );

    buttons = screen.getAllByRole("button");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Saving should make calls to saveNewShader() and updateShader()", async () => {
    await buttons[buttons.length - 1].click(); // saveButton == buttons[buttons.length - 1]

    expect(saveNewShaderMock).toHaveBeenCalledTimes(1);
    expect(saveNewShaderMock).toHaveBeenCalledWith(
      new Shader(
        "",
        "Untitled",
        "testimageurl.com/image",
        false,
        shaderTriangleVertex,
        MeshType.RECTANGLE,
        "",
        "",
        rectangleNumberOfVertices.toString(),
        "testimageurl.com/image"
      )
    );

    expect(updateShaderMock).toHaveBeenCalledTimes(1);
    expect(updateShaderMock).toHaveBeenCalledWith(defaultShader);
  });

  test("Saving should close the form", async () => {
    await buttons[buttons.length - 1].click();
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  test("Cancelling should close the form", async () => {
    await buttons[0].click(); // buttons[0] == cancel button
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  test("Typing into the text editor should change the filename", async () => {
    const nameField: HTMLElement = screen.getAllByRole("textbox")[0];

    await act(async () => {
      await userEvent.type(nameField, "a");
      await buttons[buttons.length - 1].click();
    });

    expect(saveNewShaderMock).toHaveBeenCalledWith(
      new Shader(
        "",
        "a",
        "testimageurl.com/image",
        false,
        shaderTriangleVertex,
        MeshType.RECTANGLE,
        "",
        "",
        rectangleNumberOfVertices.toString(),
        "testimageurl.com/image"
      )
    );
  });
});
