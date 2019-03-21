import "babel-polyfill";
import { splashImage } from "./assets/resource.js";
const canvas = document.getElementById("testcanvas") as HTMLCanvasElement;
canvas.width = 1200;
canvas.height = 1200;
const ctx = canvas.getContext("2d");
import { setup } from "./funs";
function doTest(fun: (inputImage: ImageData) => ImageData) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  /// 执行任务
  const start_time = performance.now();
  const newImageData = fun(imageData);
  const end_time = performance.now();
  /// 将执行结果显示到界面上
  // ctx.putImageData(newImageData, 0, 0);
  const diff_time = end_time - start_time;
  // 打印结果
  // console.log(fun.name, diff_time);
  return diff_time;
}

(async function test() {
  document.body.appendChild(canvas);
  const img = new Image();
  img.src = splashImage;
  img.crossOrigin = "Anonymous";
  await new Promise(
    cb => (img.onload = () => (ctx.drawImage(img, 0, 0), cb()))
  );
  const funs = await setup();
  self["funs"] = funs;

  const test_times = 10;
  for (const funname in funs) {
    const fun = funs[funname];
    if (typeof fun === "function") {
      console.log(`%c run test [${funname}]`, "font-size:1.2rem;color:blue;");
      performance.mark(`${funname} start`);
      for (let i = 0; i < test_times; i += 1) {
        doTest(fun);
      }
      performance.mark(`${funname} end`);
      performance.measure(funname, `${funname} start`, `${funname} end`);
      console.table(performance.getEntriesByName(funname)[0]);
    }
  }

  performance.clearMarks();
  performance.clearMeasures();
})();
self["canvas"] = canvas;
self["ctx"] = ctx;
self["doTest"] = doTest;
