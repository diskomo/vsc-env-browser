const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src", "webview");
const outDir = path.join(__dirname, "..", "out", "webview");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cssFile = path.join(srcDir, "envTable.css");
const destCssFile = path.join(outDir, "envTable.css");

if (fs.existsSync(cssFile)) {
  fs.copyFileSync(cssFile, destCssFile);
  console.log("Copied envTable.css to out/webview/");
}

