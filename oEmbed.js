import fs from "fs";
import path from "path";

export default function () {
  let jsonData;

  return {
    name: "generate-oEmbed-json",
    apply: "build",
    configResolved(config) {
      const style = [
        "border: none",
        `width: ${config.env.VITE_SEO_IMAGE_WIDTH}`,
        `height: ${config.env.VITE_SEO_IMAGE_HEIGHT}`
      ].join(";");
      jsonData = {
        "type": "rich",
        "version": "1.0",
        "title": config.env.VITE_TITLE,
        "provider_name": "flip-forge",
        "provider_url": "https://github.com/flip-forge/",
        "thumbnail_url": config.env.VITE_SEO_IMAGE_URL,
        "thumbnail_width": config.env.VITE_SEO_IMAGE_WIDTH,
        "thumbnail_height": config.env.VITE_SEO_IMAGE_HEIGHT,
        "width": config.env.VITE_SEO_IMAGE_WIDTH,
        "height": config.env.VITE_SEO_IMAGE_HEIGHT,
        "html": `<iframe src="${config.env.VITE_FULL_URL}" style="${style}"></iframe>`
      };
    },
    writeBundle(options) {
      const dirPath = path.join(options.dir, "services");
      const destPath = path.join(dirPath, "oembed");
      fs.mkdirSync(dirPath);
      fs.writeFileSync(destPath, JSON.stringify(jsonData, null, 2));
    }
  };
};
