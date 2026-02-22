#!/usr/bin/env node
/**
 * Reads style-svg.css (single source of truth) and generates js/style-svg-css.js
 * so the exporter can embed the same CSS when fetch fails. Run before dev/build:
 *   npm run build-style-svg-css
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "style-svg.css");
const out = path.join(root, "js", "style-svg-css.js");

const css = fs.readFileSync(src, "utf8");

// Escape for JS template literal: \ ` ${
const escaped = css
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const outContent = `/**
 * Generated from style-svg.css — do not edit.
 * Regenerate with: npm run build-style-svg-css
 * Used by exporter as fallback when fetch(style-svg.css) fails.
 */
export const styleSvgCss = \`${escaped}\`;
`;

fs.writeFileSync(out, outContent, "utf8");
console.log("Generated js/style-svg-css.js from style-svg.css");
