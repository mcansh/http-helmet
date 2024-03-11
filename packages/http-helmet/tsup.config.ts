import { defineConfig } from "tsup";
import pkgJson from "./package.json";

let external = Object.keys(pkgJson.dependencies || {});

export default defineConfig({
  shims: true,
  entry: ["src/index.ts", "src/react.tsx"],
  sourcemap: true,
  external,
  tsconfig: "./tsconfig.json",
  dts: true,
  target: "es2022",
  clean: true,
  format: ["cjs", "esm"],
});
