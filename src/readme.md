# WebGPUniverse

[WebGPUniverse](https://webgpuniverse.netlify.app) is an online playground for the WebGPU API and WGSL shading language. With it, users can write and save
shaders, as well as share them with the wider community publicly. It supports creating (custom) 2D meshes, 3D meshes
and compute shaders in the form of particle physics.

## Running Locally

Running the platform locally requires React, TypeScript and `npm` version `6.14.x` or higher.

After installing these and cloning the repository, run the following commands to run the platform locally:

- `npm install`
- `npm start`

Once the server has started, the platform will be available from `localhost:3000`.

## Using WebGPUniverse

In order to use WebGPUniverse to render shaders, a browser which reliably supports WebGPU must be installed. For this, we recommend the
development build of Google Chrome (Canary) with the `unsafe-webgpu` flag enabled. After downloading Chrome Canary, visit
`about:flags#enable-unsafe-webgpu` and enable "Unsafe WebGPU" to allow for  shader rendering.

## Authors and Acknowledgement

This project was created for the (Imperial College London) 3rd Year Software Engineering project by: Anna Chen, Sophie Elliott, Rohan Gupta, Alex Usher, Apoorva Verma, Vincent Wang and Hannah
Watson. We give thanks to [Alastair Donaldson](https://www.github.com/afd) for supervising the project.