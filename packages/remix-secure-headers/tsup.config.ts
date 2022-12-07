import { defineConfig } from "tsup";

export default defineConfig(async (_options) => {
  let pkgJson = await import("./package.json", { assert: { type: "json" } });
  let target = "node14";

  return [
    {
      entry: [pkgJson.source],
      format: "cjs",
      sourcemap: true,
      target,
    },
    {
      entry: [pkgJson.source],
      format: "esm",
      sourcemap: true,
      target,
      dts: true,
    },
  ];
});
