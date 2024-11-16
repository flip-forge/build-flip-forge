import path from "node:path";
import fs from "node:fs";
import console from "node:console";
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";
import core from "@actions/core";

function ensureTrailingSlash(str: string): string {
  return str.endsWith("/") ? str : `${str}/`;
}

function execCommand(command: unknown[], options?: ExecFileSyncOptions) {
  if (command.length === 0) throw new Error("Command missing");

  const cmdFile = String(command[0]);
  const cmdArgs = command.slice(1).map(String);
  console.info("\t", cmdFile, cmdArgs.join(" "));
  return execFileSync(cmdFile, cmdArgs, options);
}

function getPdfInfo(pdfPath: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pdfInfo = execCommand(["pdfinfo", pdfPath]);
  pdfInfo
    .toString()
    .split("\n")
    .forEach((s: string) => {
      const line = s.trim();
      if (!line) return;

      const splitPoint = line.indexOf(":");
      if (splitPoint === -1) {
        console.warn("Unable to parse line:", line);
        return;
      }

      const key = line.slice(0, splitPoint).trim().toLowerCase();
      result[key] = line.slice(splitPoint + 1).trim();
    });
  console.info("Parsed PDF info:", result);
  return result;
}

function getImageSize(imgPath: string): [number, number] {
  const output = execCommand(["identify", "-format", "%wx%h", imgPath]);
  const [width, height] = output.toString().split("x").map(Number);
  return [width, height];
}

function convertPageToSVG(pdfPath: string, page: number) {
  execCommand([
    "pdftocairo",
    "-f",
    page,
    "-l",
    page,
    "-svg",
    pdfPath,
    `public/page-${page}.svg`,
  ]);
}

function convertPagetoJPG(pdfPath: string, page: number) {
  execCommand([
    "pdftocairo",
    "-f",
    page,
    "-l",
    page,
    "-jpeg",
    "-jpegopt",
    "quality=60,progressive=y,optimize=y",
    "-scale-to",
    1024,
    "-singlefile",
    pdfPath,
    `public/page-${page}`,
  ]);
}

function main(): void {
  const pdfPath = path.join(
    process.env.GITHUB_WORKSPACE ?? "",
    core.getInput("file", { required: true, trimWhitespace: true }) ?? "",
  );
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    core.setFailed(`Could not find file: '${pdfPath}'`);
    process.exit(1);
  }
  const pdfInfo = getPdfInfo(pdfPath);
  const nrPages = parseInt(pdfInfo.pages ?? "0", 10);

  if (nrPages <= 0) {
    core.setFailed("Unable to parse book info, could not find number of pages");
    process.exit(1);
  }

  if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
  }

  for (let page = 1; page <= nrPages; page += 1) {
    console.info("Processing page:", page);
    convertPageToSVG(pdfPath, page);
    convertPagetoJPG(pdfPath, page);
  }

  const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "/").split("/");
  const fullUrl = ensureTrailingSlash(
    process.env.VITE_FULL_URL || `https://${owner}.github.io/${repo}/`,
  );
  const [imgWidth, imgHeight] = getImageSize("public/page-1.jpg");

  const env = {
    ...process.env,
    VITE_BASE_URL: ensureTrailingSlash(process.env.VITE_BASE_URL || `${repo}/`),
    VITE_FULL_URL: fullUrl,
    VITE_TITLE:
      core.getInput("title", { trimWhitespace: true }) ||
      pdfInfo.title ||
      "Flipbook",
    VITE_BACKGROUND_COLOR: core.getInput("backgroundColor") ?? "#000000",
    VITE_TOOLBAR_COLOR: core.getInput("backgroundColor") ?? "#ffffff",
    VITE_DESCRIPTION: core.getInput("description") ?? "",
    VITE_PAGE_NUMBER: String(nrPages),
    VITE_FILE_DOWNLOAD: path.basename(pdfPath),
    VITE_SEO_IMAGE: "page-1.jpg",
    VITE_SEO_IMAGE_URL: `${fullUrl}page-1.jpg`,
    VITE_SEO_IMAGE_WIDTH: String(imgWidth),
    VITE_SEO_IMAGE_HEIGHT: String(imgHeight),
  };

  execCommand(["npm", "run", "build-only"], { env });
  core.setOutput("dist", path.resolve("dist"));
}

main();
