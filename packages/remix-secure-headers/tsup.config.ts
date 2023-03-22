import path from "node:path";
import { defineConfig } from "tsup";
import type { Options } from "tsup";
import glob from "glob";
import pkgJson from "./package.json";

let external = Object.keys(pkgJson.dependencies || {});

let entry = glob.sync("src/**/*.ts");

export default defineConfig(() => {
  let outDir = path.dirname(pkgJson.main);
  let target = "node14";

  let shared_options: Options = {
    entry: ["src/index.ts"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
  };

  return [
    {
      ...shared_options,
      format: "cjs",
    },
    {
      ...shared_options,
      format: "esm",
      dts: true,
    },
  ];
});
