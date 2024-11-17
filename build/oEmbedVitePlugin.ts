/* eslint-disable camelcase */

import fs from "fs";
import path from "path";
import { PluginOption } from "vite";

interface oEmbedBase {
  type: string;
  version: "1.0";
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
}

interface oEmbedPhoto extends oEmbedBase {
  type: "photo";
  url: string;
  width: number;
  height: number;
}

interface oEmbedVideo extends oEmbedBase {
  type: "video";
  html: string;
  width: number;
  height: number;
}

interface oEmbedLink extends oEmbedBase {
  type: "link";
}

interface oEmbedRich extends oEmbedBase {
  type: "rich";
  html: string;
  width: number;
  height: number;
}

type OEmbedVitePlugin = oEmbedPhoto | oEmbedVideo | oEmbedLink | oEmbedRich;

export default function oEmbedVitePlugin(): PluginOption {
  let jsonData = null as null | OEmbedVitePlugin;

  return {
    name: "vite-plugin-oEmbed",
    apply: "build",
    configResolved(config) {
      const style = [
        "border: none",
        `width: ${config.env.VITE_SEO_IMAGE_WIDTH}px`,
        `height: ${config.env.VITE_SEO_IMAGE_HEIGHT}px`,
      ].join(";");
      jsonData = {
        type: "rich",
        version: "1.0",
        title: config.env.VITE_TITLE,
        provider_name: "flip-forge",
        provider_url: "https://github.com/flip-forge/",
        thumbnail_url: config.env.VITE_SEO_IMAGE_URL,
        thumbnail_width: config.env.VITE_SEO_IMAGE_WIDTH,
        thumbnail_height: config.env.VITE_SEO_IMAGE_HEIGHT,
        width: config.env.VITE_SEO_IMAGE_WIDTH,
        height: config.env.VITE_SEO_IMAGE_HEIGHT,
        html: `<iframe src="${config.env.VITE_FULL_URL}" style="${style}"></iframe>`,
      };
    },
    writeBundle(options) {
      const dirPath = path.join(options.dir as string, "services");
      const destPath = path.join(dirPath, "oembed.json");
      fs.mkdirSync(dirPath);
      fs.writeFileSync(destPath, JSON.stringify(jsonData, null, 2));
    },
  };
}
