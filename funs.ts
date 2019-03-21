function normalLoop(inputImage: ImageData) {
  const outputImage = new ImageData(inputImage.height, inputImage.width);
  const input_u32 = new Uint32Array(inputImage.data.buffer);
  const output_u32 = new Uint32Array(outputImage.data.buffer);
  for (let y = 0; y < inputImage.height; y += 1) {
    for (let x = 0; x < inputImage.width; x += 1) {
      output_u32[y + x * outputImage.width] =
        input_u32[x + y * inputImage.width];
    }
  }
  return outputImage;
}
function tilingLoop(inputImage: ImageData) {
  const tileSize = 50;
  const outputImage = new ImageData(inputImage.height, inputImage.width);
  const input_u32 = new Uint32Array(inputImage.data.buffer);
  const output_u32 = new Uint32Array(outputImage.data.buffer);
  let x = 0;
  let y = 0;

  for (let y_start = 0; y_start < inputImage.height; y_start += tileSize) {
    for (let x_start = 0; x_start < inputImage.width; x_start += tileSize) {
      const y_end = Math.min(inputImage.height, y_start + tileSize);
      const x_end = Math.min(inputImage.width, x_start + tileSize);

      for (let y = y_start; y < y_end; y += 1) {
        for (let x = x_start; x < x_end; x += 1) {
          output_u32[y + x * outputImage.width] =
            input_u32[x + y * inputImage.width];
        }
      }
    }
  }
  return outputImage;
}
import { memory, wasmLoop } from "./assets/resource.js";
export async function initWasmLoop() {
  // const { instance } = await WebAssembly.instantiateStreaming(
  //   fetch("./assets/tiling-loop.wasm"),
  //   {
  //     env: {
  //       memory: new WebAssembly.Memory({ initial: 256 })
  //     }
  //   }
  // );
  return function wasmLoopWrapper(inputImage: ImageData) {
    const imageWH = inputImage.width * inputImage.height;
    const bytesPerImage = imageWH * 4;
    /// 使用两倍的数据，前面放原图，后面放新图
    const minimumMemorySize = bytesPerImage * 2;
    const pagesNeeded = Math.ceil(minimumMemorySize / (64 * 1024));
    // const { memory } = instance.exports;
    memory.grow(pagesNeeded);
    /// 将数据放入wasm的内存对象中
    const memoryTypedArray = new Uint8ClampedArray(
      memory.buffer,
      0,
      minimumMemorySize
    );
    memoryTypedArray.set(inputImage.data);
    /// 执行函数
    wasmLoop(inputImage.width, inputImage.height);
    /// 导出函数
    const outputImage = new ImageData(inputImage.height, inputImage.width);
    new Uint8ClampedArray(outputImage.data.buffer).set(
      memoryTypedArray.subarray(bytesPerImage)
    );
    return outputImage;
  };
}

export async function setup() {
  const wasmLoop = await initWasmLoop();
  return {
    normalLoop,
    tilingLoop,
    wasmLoop
  };
}
