export const getImageFromUrl = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // required for webgpu pipeline
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
