import * as console from "node:console";
import { Command } from "commander";
import { version } from "../package.json";
import { buildFlipForge, type BuildOptions } from "./build";

function main() {
  const program = new Command();
  program
    .name("build-flip-forge")
    .description("Build flip forge site from cmd line")
    .version(version)
    .argument("<pdfPath>", "PDF File to build site from")
    .option("--base-url <value>", "Base url of the site", "")
    .option("--full-url <value>", "Full url of the site", "")
    .option("--title <value>", "Meta title of the site", "")
    .option("--description <value>", "Meta description for the site", "")
    .option("--write-env", "", false)
    .allowExcessArguments(false);
  program.parse();

  const [pdfPath] = program.processedArgs;
  const options = program.opts();

  console.log(options);
  buildFlipForge({
    pdfPath,
    ...options,
  } as BuildOptions);
}

main();
