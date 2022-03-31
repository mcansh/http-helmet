#!/usr/bin/env node
const path = require("path");
const { build, ts, tsconfig, dirname, glob, log } = require("estrella");
const pkgJSON = require("../package.json");

build({
  entry: path.resolve(pkgJSON.source),
  outfile: path.resolve(pkgJSON.main),
  bundle: true,
});
