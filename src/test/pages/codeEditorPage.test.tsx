const helper = require("../../helper")
const shaders = require("../../render")
import {render} from "@testing-library/react"
import CodeEditorPage from "../../pages/CodeEditorPage"
import {shaderTriangleFragment, shaderTriangleVertex} from "../../render"

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
    checkWebGPUMock.mockReturnValue(true)
    simpleShaderMock = jest.spyOn(shaders, "renderSimpleShader")
    simpleShaderMock.mockImplementation(() => {
    })
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

describe("Show Code Button Click Tests", () => {
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
        expect(document.getElementById(COMPILE_ID)).not.toBeNull()
    })

    test("Clicking the show code button displays the vertex editor", () => {
        showCodeButton!.click()
        const vertexEditorDiv = document.querySelector(`.${VERTEX_EDITOR_CLASS}`)
        expect(vertexEditorDiv?.hasChildNodes()).toBeTruthy()
    })

    test("Clicking the show code button displays the fragment editor", () => {
        showCodeButton!.click()
        const fragmentEditorDiv = document.querySelector(`.${FRAGMENT_EDITOR_CLASS}`)
        expect(fragmentEditorDiv?.hasChildNodes()).toBeTruthy()
    })
})
