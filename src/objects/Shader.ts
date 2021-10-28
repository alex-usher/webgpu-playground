import {rectangleFragment, rectangleVertex} from "../render";

export class Shader {
    // title: title of shader
    // image: image src (http link)
    // vertexCode: ideally a string
    // fragmentCode: ideally a string
    readonly image: string;
    fragmentCode: string;
    readonly title: string;
    vertexCode: string;

    constructor(title: string, image: string, vertexCode: string, fragmentCode: string) {
        this.title = title
        this.image = image
        this.vertexCode = vertexCode
        this.fragmentCode = fragmentCode
    }
}

export interface ShaderProps {
    shader: Shader
}

export const defaultShader = new Shader("Triangle", "https://i.ibb.co/M5Z06wy/triangle.png", rectangleVertex, rectangleFragment)