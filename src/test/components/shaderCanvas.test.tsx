const helper = require("../../helper")
const shaders = require("../../render")
import {render} from "@testing-library/react";
import ShaderCanvas from "../../components/ShaderCanvas";
import {shaderTriangleFragment, shaderTriangleVertex} from "../sample_shaders/triangle";

const renderShaderCanvas = () =>
    render(<ShaderCanvas vertexCode={shaderTriangleVertex} fragmentCode={shaderTriangleFragment}/>)

let checkWebGPUMock: jest.SpyInstance
let simpleShaderMock: jest.SpyInstance
describe("Shader Canvas component tests", () => {
    beforeEach(() => {
        checkWebGPUMock = jest.spyOn(helper, "checkWebGPU")
        simpleShaderMock = jest.spyOn(shaders, "renderShader")
        simpleShaderMock.mockImplementation(() => {})
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it("Should not render the canvas when WebGPU is disabled", async () => {
        checkWebGPUMock.mockReturnValue(false)

        renderShaderCanvas()

        expect(document.getElementById('canvas-webgpu')).toBeNull()
    })

    it("Should render the canvas when WebGPU is enabled", async () => {
        checkWebGPUMock.mockReturnValue(true)

        renderShaderCanvas()

        expect(document.getElementById('canvas-webgpu')).not.toBeNull()
    })

    it("Should make calls to renderShader to render onto the canvas", () => {
        checkWebGPUMock.mockReturnValue(true)

        renderShaderCanvas()

        expect(simpleShaderMock).toHaveBeenCalledTimes(1)
    })
})