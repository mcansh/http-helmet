import fsp from "node:fs/promises";
import { defineConfig } from "tsup";
import chalk from "chalk";
import { getExportsRuntime } from "pkg-exports";
import { format } from "prettier";
import pkgJson from "./package.json";

let external = Object.keys(pkgJson.dependencies || {});

let js = String.raw;

export default defineConfig(() => {
  return {
    shims: true,
    entry: ["src/index.ts", "src/react.tsx"],
    sourcemap: true,
    external,
    tsconfig: "./tsconfig.json",
    dts: true,
    format: ["cjs", "esm"],
    async onSuccess() {
      // create react entrypoints at root of package
      let files = [
        "react.cjs",
        "react.js",
        "react.d.cts",
        "react.d.ts",
      ] as const;

      for (let file of files) {
        let contents: string;

        if (file.endsWith(".d.ts") || file.endsWith(".d.cts")) {
          // if it's a declaration file, just copy it
          contents = await fsp.readFile(`./dist/${file}`, "utf-8");
        } else if (file.endsWith(".cjs")) {
          let exports = (await getExportsRuntime(
            "./dist/react.cjs",
          )) as string[];

          // https://nodejs.org/api/esm.html#commonjs-namespaces
          // When importing CommonJS modules, the module.exports object is provided as the default export
          // and make import { xxx } from './react' work
          contents = js`
            ${exports.map((e) => `exports.${e} = require("./dist/${file}").${e};`).join("\n")}
          `;
        } else if (file.endsWith(".js")) {
          let exports = (await getExportsRuntime(
            "./dist/react.js",
          )) as string[];
          contents = js`export { ${exports.join(", ")} } from "./dist/${file}";`;
        } else {
          console.error(`Unknown file type ${file} for react`);
          return process.exit(1);
        }

        let formatted = await format(contents, { parser: "typescript" });

        await fsp.writeFile(file, formatted);
        console.log(chalk.green(`Created ${file} redirect file`));
      }
    },
  };
});
