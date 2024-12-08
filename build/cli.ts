import { parseArgs } from "node:util";
import * as console from "node:console";
import { buildFlipForge } from "./build";

function main() {
  const { values, positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
    options: {
      baseUrl: {
        type: "string",
        default: "",
      },
      fullUrl: {
        type: "string",
        default: "http://localhost:8080",
      },
      title: {
        type: "string",
        default: "",
      },
      description: {
        type: "string",
        default: "",
      },
      writeEnv: {
        type: "boolean",
        default: true,
      },
    },
  });

  if (positionals.length !== 1) {
    console.error("One file must be specified, got:", positionals);
    process.exit(1);
  }

  buildFlipForge({
    pdfPath: positionals[0],
    ...values,
  });
}

main();
