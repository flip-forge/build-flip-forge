import path from "node:path";
import fs from "node:fs";
import console from "node:console";
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";

const STEPS = JSON.parse(process.env.STEPS ?? "{}");
const INPUTS = JSON.parse(process.env.INPUTS ?? "{}");
const GITHUB = JSON.parse(process.env.GITHUB ?? "{}");

function mkdir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

function removeTrailingSlash(str: string): string {
  return str.endsWith("/") ? str.slice(0, -1) : str;
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
  console.log("Getting image size:");
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
    `public/svg/${page}.svg`,
  ]);
}

function convertPageToJPG(pdfPath: string, page: number) {
  execCommand([
    "pdftocairo",
    "-f",
    page,
    "-l",
    page,
    "-jpeg",
    "-jpegopt",
    "quality=60,progressive=y,optimize=y",
    "-r",
    54,
    "-singlefile",
    pdfPath,
    `public/jpg/${page}`,
  ]);
}

function extractSEOImage(pdfPath: string) {
  execCommand([
    "pdftocairo",
    "-f",
    1,
    "-l",
    1,
    "-jpeg",
    "-jpegopt",
    "quality=80,progressive=y,optimize=y",
    "-scale-to",
    1024,
    "-singlefile",
    pdfPath,
    `public/cover`,
  ]);
}

function buildSite(pdfInfo: Record<string, string>) {
  const [seoImgWidth, seoImgHeight] = getImageSize("public/cover.jpg");
  const [svgImgWidth, svgImgHeight] = getImageSize("public/svg/1.svg");
  const [owner, repo] = (GITHUB.repository ?? "/").split("/");
  const baseUrl = removeTrailingSlash(
    STEPS.configure?.outputs?.base_path || `/${repo}`,
  );
  const fullUrl = removeTrailingSlash(
    STEPS.configure?.outputs?.base_url || `https://${owner}.github.io/${repo}`,
  );

  const env = {
    VITE_BASE_URL: baseUrl,
    VITE_FULL_URL: fullUrl,
    VITE_TITLE: INPUTS.title || pdfInfo.title || "Flipbook",
    VITE_BACKGROUND_COLOR: INPUTS.backgroundcolor ?? "#000000",
    VITE_TOOLBAR_COLOR: INPUTS.backgroundcolor ?? "#ffffff",
    VITE_DESCRIPTION: INPUTS.description ?? "",
    VITE_PAGE_NUMBER: pdfInfo.pages,
    VITE_FILE_DOWNLOAD: path.basename(INPUTS.file),
    VITE_SEO_IMAGE: "cover.jpg",
    VITE_SEO_IMAGE_URL: `${fullUrl}/cover.jpg`,
    VITE_SEO_IMAGE_WIDTH: String(seoImgWidth),
    VITE_SEO_IMAGE_HEIGHT: String(seoImgHeight),
    VITE_SVG_IMAGE_WIDTH: String(svgImgWidth),
    VITE_SVG_IMAGE_HEIGHT: String(svgImgHeight),
  };

  console.log("Building app with env:", env);
  execCommand(["npm", "run", "build-only"], {
    env: {
      ...process.env,
      ...env,
    },
  });
}

function main(): void {
  const pdfPath = path.join(GITHUB.workspace ?? "", INPUTS.file);
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    console.error("Could not find file:", pdfPath);
    process.exit(1);
  }
  const pdfInfo = getPdfInfo(pdfPath);
  const nrPages = parseInt(pdfInfo.pages ?? "0", 10);

  if (nrPages <= 0) {
    console.error(
      "Unable to parse book info, could not find number of pages",
      pdfInfo,
    );
    process.exit(1);
  }

  mkdir("public");
  mkdir("public/svg");
  mkdir("public/jpg");

  fs.copyFileSync(pdfPath, path.join("public", path.basename(pdfPath)));

  console.log("Extracting cover image");
  extractSEOImage(pdfPath);

  for (let page = 1; page <= nrPages; page += 1) {
    console.info("Processing page:", page);
    convertPageToSVG(pdfPath, page);
    convertPageToJPG(pdfPath, page);
  }

  buildSite(pdfInfo);
}

main();
