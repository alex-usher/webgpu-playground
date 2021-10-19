const helper = require("../../helper")
const shaders = require("../../render")
import {render} from "@testing-library/react"
import CodeEditorPage from "../../pages/CodeEditorPage"
import {shaderTriangleFragment,shaderTriangleVertex} from "../../render"

const renderCodeEditorPage = () => render(<CodeEditorPage defaultVertexCode={shaderTriangleVertex} defaultFragmentCode={shaderTriangleFragment}/>)

let checkWebGPUMock: jest.SpyInstance
let simpleShaderMock: jest.SpyInstance

// helper constants defining the button texts and ids
const SHOW_CODE_ID = "show-code-button"
const SHOW_CODE_TEXT = "View Code"
const HIDE_CODE_TEXT = "Hide Code"

const doMocks = () => {
    checkWebGPUMock = jest.spyOn(helper, "checkWebGPU")
    checkWebGPUMock.mockReturnValue(true)
    simpleShaderMock = jest.spyOn(shaders, "renderSimpleShader")
    simpleShaderMock.mockImplementation(() => {})
}

describe("Show Code Button Click Tests", () => {
    beforeEach(doMocks)

    afterEach(jest.resetAllMocks)

    it("Clicking the show code button changes its text", () => {
        renderCodeEditorPage()

        const showCodeButton = document.getElementById(SHOW_CODE_ID)

        expect(showCodeButton).not.toBeNull()
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)

        showCodeButton!.click()

        expect(showCodeButton!.textContent).toEqual(HIDE_CODE_TEXT)
    })

    it("Clicking the show code button alternates its text", () => {
        renderCodeEditorPage()

        const showCodeButton = document.getElementById(SHOW_CODE_ID)

        expect(showCodeButton).not.toBeNull()
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)
        showCodeButton!.click()
        showCodeButton!.click()
        expect(showCodeButton!.textContent).toEqual(SHOW_CODE_TEXT)
    })
})