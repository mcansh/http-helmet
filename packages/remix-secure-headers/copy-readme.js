import fsp from "node:fs/promises";
import path from "node:path";
import { findMonorepoRoot } from "find-monorepo-root";

let { dir } = await findMonorepoRoot();

let readme_source = path.join(dir, "README.md");
let readme_target = path.join(
  dir,
  "packages",
  "remix-secure-headers",
  "README.md",
);

await fsp.rm(readme_target, { force: true });
await fsp.copyFile(readme_source, readme_target);
