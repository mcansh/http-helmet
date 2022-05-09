#!/usr/bin/env node
const path = require("path");
const { build, ts, tsconfig, dirname, glob, log } = require("estrella");
const pkgJSON = require("../package.json");

build({
  entry: path.resolve(pkgJSON.source),
  outfile: path.resolve(pkgJSON.main),
  bundle: true,
  format: "cjs",
  minify: false,
});

build({
  entry: path.resolve(pkgJSON.source),
  outfile: path.resolve(pkgJSON.module),
  bundle: true,
  format: "esm",
  minify: false,
  onEnd(config) {
    let dtsFilesOutdir = dirname(config.outfile);
    generateTypeDefs(tsconfig(config), config.entry, dtsFilesOutdir);
  },
});

function generateTypeDefs(tsconfig, entryfiles, outdir) {
  let filenames = Array.from(
    new Set(
      (Array.isArray(entryfiles) ? entryfiles : [entryfiles]).concat(
        tsconfig.include || []
      )
    )
  ).filter((v) => v);
  log.info("Generating type declaration files for", filenames.join(", "));
  let compilerOptions = {
    ...tsconfig.compilerOptions,
    moduleResolution: undefined,
    declaration: true,
    outDir: outdir,
  };
  let program = ts.ts.createProgram(filenames, compilerOptions);
  let targetSourceFile = undefined;
  let writeFile = undefined;
  let cancellationToken = undefined;
  let emitOnlyDtsFiles = true;
  program.emit(
    targetSourceFile,
    writeFile,
    cancellationToken,
    emitOnlyDtsFiles
  );
  log.info("Wrote", glob(outdir + "/*.d.ts").join(", "));
}
