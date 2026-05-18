const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { secureDelete } = require("../utils/secureDelete");

const fsp = fs.promises;
const CONVERT_TIMEOUT_MS = 60_000;

function runLibreOffice(inputFilePath, outputDir) {
  return new Promise((resolve, reject) => {
    // Spawn LibreOffice in headless mode for conversion.
    const args = [
      "--headless",
      "--convert-to",
      "pdf",
      "--outdir",
      outputDir,
      inputFilePath
    ];

    const child = spawn("soffice", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    const timeoutId = setTimeout(() => {
      // Kill the process if it exceeds the allowed time.
      child.kill("SIGKILL");
      reject(new Error("LibreOffice conversion timed out"));
    }, CONVERT_TIMEOUT_MS);

    child.stdout.on("data", chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", chunk => {
      stderr += chunk.toString();
    });

    child.on("error", err => {
      clearTimeout(timeoutId);
      reject(err);
    });

    child.on("close", code => {
      clearTimeout(timeoutId);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`LibreOffice failed with exit code ${code}: ${stderr || stdout}`));
    });
  });
}

async function convertToPdf(inputFilePath, outputDir) {
  let outputFilePath = "";

  try {
    // Prepare output location and expected PDF path.
    await fsp.mkdir(outputDir, { recursive: true });
    const parsed = path.parse(inputFilePath);
    outputFilePath = path.join(outputDir, `${parsed.name}.pdf`);

    // Execute LibreOffice conversion with timeout guard.
    await runLibreOffice(inputFilePath, outputDir);

    // Verify the PDF exists after conversion.
    await fsp.access(outputFilePath, fs.constants.F_OK);

    return outputFilePath;
  } catch (err) {
    // Surface conversion errors to the caller.
    throw err;
  } finally {
    // Always securely delete the source file for privacy, even on errors.
    await secureDelete(inputFilePath);
  }
}

module.exports = {
  convertToPdf
};
