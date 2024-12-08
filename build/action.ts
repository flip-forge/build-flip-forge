import { buildFlipForge } from "./build";
import path from "path";

function removeTrailingSlash(str: string): string {
  return str.endsWith("/") ? str.slice(0, -1) : str;
}

/**
 * Build flip forge site from github actions
 */
function main() {
  const STEPS = JSON.parse(process.env.STEPS ?? "{}");
  const INPUTS = JSON.parse(process.env.INPUTS ?? "{}");
  const GITHUB = JSON.parse(process.env.GITHUB ?? "{}");

  const [owner, repo] = (GITHUB.repository ?? "/").split("/");

  buildFlipForge({
    pdfPath: path.join(GITHUB.workspace ?? "", INPUTS.file),
    baseUrl: removeTrailingSlash(
      STEPS.configure?.outputs?.base_path || `/${repo}`,
    ),
    fullUrl: removeTrailingSlash(
      STEPS.configure?.outputs?.base_url ||
        `https://${owner}.github.io/${repo}`,
    ),
    title: INPUTS.title,
    backgroundColor: INPUTS.backgroundcolor,
    toolbarColor: INPUTS.toolbarcolor,
    description: INPUTS.description,
  });
}

main();
