import fs from "node:fs";
import console from "node:console";
import { execFileSync, type ExecFileSyncOptions } from "node:child_process";
import path from "node:path";

export interface BuildOptions {
  pdfPath: string;
  baseUrl: string;
  fullUrl: string;
  title?: string;
  backgroundColor?: string;
  toolbarColor?: string;
  description?: string;
}

function mkdir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
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

function buildSite(pdfInfo: Record<string, string>, options: BuildOptions) {
  const [seoImgWidth, seoImgHeight] = getImageSize("public/cover.jpg");
  const [svgImgWidth, svgImgHeight] = getImageSize("public/svg/1.svg");

  const env = {
    VITE_BASE_URL: options.baseUrl,
    VITE_FULL_URL: options.fullUrl,
    VITE_TITLE: options.title || pdfInfo.title || "Flipbook",
    VITE_BACKGROUND_COLOR: options.backgroundColor ?? "#000000",
    VITE_TOOLBAR_COLOR: options.backgroundColor ?? "#ffffff",
    VITE_DESCRIPTION: options.description ?? "",
    VITE_PAGE_NUMBER: pdfInfo.pages,
    VITE_FILE_DOWNLOAD: path.basename(options.pdfPath),
    VITE_SEO_IMAGE: "cover.jpg",
    VITE_SEO_IMAGE_URL: `${options.fullUrl}/cover.jpg`,
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

export function buildFlipForge(options: BuildOptions): void {
  const { pdfPath } = options;
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

  buildSite(pdfInfo, options);
}
