import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/depthtext.ts"],
  outDir: "dist",
  clean: true,
  dts: true,
  format: ["esm", "cjs", "iife"],
  globalName: "DepthText",
  minify: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: "es2020",
  legacyOutput: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : format === "esm" ? ".mjs" : ".global.js",
    };
  },
});
