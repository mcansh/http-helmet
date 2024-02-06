import { defineConfig } from "tsup";
import type { Options } from "tsup";
import pkgJson from "./package.json";

let external = Object.keys(pkgJson.dependencies || {});

export default defineConfig(() => {
  let options: Options = {
    shims: true,
    entry: ["src/index.ts", "src/remix.tsx"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
    dts: true,
  };

  return [
    {
      ...options,
      format: "cjs",
    },
    {
      ...options,
      format: "esm",
    },
  ];
});
