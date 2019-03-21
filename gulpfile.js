const gulp = require("gulp");

gulp.task("build", callback => {
  const asc = require("assemblyscript/bin/asc");
  asc.main([
    "wasmLoop.ts",
    "--baseDir", "assembly",
    "--binaryFile", "../assets/wasmLoop.wasm",
    "--sourceMap",
    "--measure"
  ], callback);
});

gulp.task("default", ["build"]);
