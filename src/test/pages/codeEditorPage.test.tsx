const helper = require("../../helper")
const shaders = require("../../render")
import userEvent from "@testing-library/user-event"
import {render} from "@testing-library/react"
import {screen} from "@testing-library/dom"
import CodeEditorPage from "../../pages/CodeEditorPage"
import {shaderTriangleFragment, shaderTriangleVertex} from "../../render"

import '@testing-library/jest-dom/extend-expect';

const renderCodeEditorPage = () => render(<CodeEditorPage defaultVertexCode={shaderTriangleVertex}
                                                          defaultFragmentCode={shaderTriangleFragment}/>)

let checkWebGPUMock: jest.SpyInstance
let simpleShaderMock: jest.SpyInstance

// helper constants defining the button texts and ids
const SHOW_CODE_ID = "show-code-button"
const COMPILE_ID = "compile-button"
const VERTEX_EDITOR_CLASS = "vertex-editor"
const FRAGMENT_EDITOR_CLASS = "fragment-editor"
const SHOW_CODE_TEXT = "View Code"
const HIDE_CODE_TEXT = "Hide Code"

const doMocks = () => {
    checkWebGPUMock = jest.spyOn(helper, "checkWebGPU")
    checkWebGPUMock.mockImplementation(() => true)
    simpleShaderMock = jest.spyOn(shaders, "renderSimpleShader")
    simpleShaderMock.mockImplementation(() => {})
}

describe("Default render tests", () => {
    beforeEach(() => {
        doMocks()
        renderCodeEditorPage()
    })

    afterEach(jest.resetAllMocks)

    test("By default the fragment editor is not rendered", () => {
        const fragmentEditorDiv = document.querySelector(`.${FRAGMENT_EDITOR_CLASS}`)
        expect(fragmentEditorDiv?.hasChildNodes()).toBeFalsy()
    })


    test("By default the vertex editor is not rendered", () => {
        const vertexEditorDiv = document.querySelector(`.${VERTEX_EDITOR_CLASS}`)
        expect(vertexEditorDiv?.hasChildNodes()).toBeFalsy()
    })
})

describe("Button Click Tests", () => {
    let showCodeButton: HTMLElement | null

    beforeEach(() => {
        doMocks()
        renderCodeEditorPage()
        showCodeButton = document.getElementById(SHOW_CODE_ID)
    })

    afterEach(() => {
        jest.resetAllMocks()
        showCodeButton = null
    })

    test("Clicking the show code button changes its text", () => {
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)
        showCodeButton!.click()
        expect(showCodeButton!.textContent).toEqual(HIDE_CODE_TEXT)
    })

    test("Clicking the show code button alternates its text", () => {
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)
        showCodeButton!.click()
        showCodeButton!.click()
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)
    })

    test("Clicking the show code button displays the compile button", () => {
        showCodeButton!.click()
        expect(document.getElementById(COMPILE_ID)).toBeInTheDocument()
    })

    test("Clicking the show code button displays the vertex and fragment editor", () => {
        showCodeButton!.click()
        const fragmentEditorDiv = document.querySelector(`.${FRAGMENT_EDITOR_CLASS}`)
        expect(fragmentEditorDiv?.hasChildNodes()).toBeTruthy()
        const vertexEditorDiv = document.querySelector(`.${VERTEX_EDITOR_CLASS}`)
        expect(vertexEditorDiv?.hasChildNodes()).toBeTruthy()

        const textAreas: HTMLElement[] = screen.getAllByRole("textbox")
        expect(textAreas.length).toBe(2)
        expect(textAreas[0]).toBeInTheDocument()
        expect(textAreas[1]).toBeInTheDocument()
    })

    test("Clicking the compile code button results in calling the WebGPU render function", () => {
        expect(simpleShaderMock).toHaveBeenCalled()
        showCodeButton!.click()
        const compileCodeButton = document.getElementById(COMPILE_ID)

        compileCodeButton!.click()

        expect(checkWebGPUMock).toHaveBeenCalled()
        expect(simpleShaderMock).toHaveBeenCalled()
    })
})

describe("Code editor tests", () => {
    let vertexEditor: HTMLElement | null
    let fragmentEditor: HTMLElement | null

    beforeEach(() => {
        doMocks()
        renderCodeEditorPage()

        document.getElementById(SHOW_CODE_ID)!.click()
        const textAreas: HTMLElement[] = screen.getAllByRole("textbox")
        vertexEditor = textAreas[0]
        fragmentEditor = textAreas[1]
    })

    afterEach(() => {
        jest.resetAllMocks()

        vertexEditor = null
        fragmentEditor = null
    })

    test("Typing into the vertex code editor updates its text content", () => {
        expect(vertexEditor!.textContent).toEqual(shaderTriangleVertex)
        userEvent.type(vertexEditor!, "a")
        expect(vertexEditor!.textContent).toEqual(`${shaderTriangleVertex}a`)
    })

    test("Typing into the fragment code editor updates its text content", () => {
        expect(fragmentEditor!.textContent).toEqual(shaderTriangleFragment)
        userEvent.type(fragmentEditor!, "a")
        expect(fragmentEditor!.textContent).toEqual(`${shaderTriangleFragment}a`)
    })
})
