/**
 * BubblesVR: convert D3 layout to VR markers format and generate QR code.
 * The QR payload is parameters-only (JSON markers array), not a URL, so it works
 * across domains and environments.
 *
 * Bridge format version (v): Bump when the JSON structure changes. VRPreview uses
 * this to select the correct parser, so printed QR codes remain valid across app updates.
 */
export const BRIDGE_VERSION = 1;

import * as d3 from "d3";
import { toCanvas } from "qrcode";

/**
 * Convert node color (name or hex) to RRGGBB hex string for VR.
 * @param {string} c - Color name (e.g. "red") or hex (e.g. "#ff0000")
 * @returns {string} - "ff0000" style
 */
function colorToHex(c) {
  if (!c || typeof c !== "string") return "ff0000";
  const col = d3.color(c);
  return col ? col.formatHex().slice(1) : "ff0000";
}

/** Round to 1 decimal place to reduce QR payload size. */
function round1(v) {
  return Math.round(v * 10) / 10;
}

/**
 * Build settings object from current D3 UI state.
 * @returns {Object} - { bg, bgPreset, bgOpacity, axis, gridV, gridH, nodeCircles, nodeIcon, nodeLabel }
 */
function getVRSettings() {
  const bgEl = document.getElementById("background-select");
  const bgOpacityEl = document.getElementById("background-opacity");
  const bgToggle = document.getElementById("toggleBackground");
  return {
    bg: bgToggle?.checked ? 1 : 0,
    bgPreset: bgEl?.value ?? "base-downhill",
    bgOpacity: Number(bgOpacityEl?.value ?? 100),
    axis: document.getElementById("toggleAxis")?.checked ? 1 : 0,
    gridV: document.getElementById("toggleVerticalGrid")?.checked ? 1 : 0,
    gridH: document.getElementById("toggleHorizontalGrid")?.checked ? 1 : 0,
    nodeCircles: document.getElementById("nodeCircles")?.checked ? 1 : 0,
    nodeIcon: document.getElementById("toggleNodeIcon")?.checked ? 1 : 0,
    nodeLabel: document.getElementById("toggleNodeLabel")?.checked ? 1 : 0,
  };
}

/**
 * Convert D3 nodes to VR payload JSON string.
 * Format: { v: BRIDGE_VERSION, nodes: [...], settings: {...} }
 * Nodes: [{"yaw", "pitch", "size", "color", "name"}]
 * Coordinates in degrees; yaw = x, pitch = -y (D3 y-down → VR y-up).
 * Numerical values rounded to 1 decimal to keep QR code simpler (bigger squares).
 * @param {Array} nodes - Datasets.nodes (simulation coords: pixels, y-down)
 * @param {number} scaleUnit - pixels per data unit
 * @returns {string} - JSON string (no URL)
 */
export function getVRMarkersString(nodes, scaleUnit) {
  const su = scaleUnit != null && scaleUnit !== 0 ? scaleUnit : 1;
  const nodeList = (nodes || []).map((n) => {
    const r = n.radius ?? 0;
    const yaw = round1(n.x / su);
    const pitch = round1(-n.y / su);
    const size = round1((2 * r) / su);
    const name = n.displayLabel ?? n.id ?? "";
    const color = colorToHex(n.color);
    return { yaw, pitch, size, color, name };
  });
  const settings = getVRSettings();
  return JSON.stringify({ v: BRIDGE_VERSION, nodes: nodeList, settings });
}

/**
 * Generate a QR code for the given text and display it in the container.
 * @param {string} text - Payload (e.g. markers JSON)
 * @param {HTMLElement} container - Element to render into (canvas or img appended)
 * @param {Object} [opts] - { getExportFilenameBase, autoDownload }
 */
export async function generateQRCode(text, container, opts = {}) {
  if (!container) return;
  container.innerHTML = "";
  let isEmpty = !text || text === "[]";
  if (!isEmpty && text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      isEmpty = !parsed?.nodes?.length;
    } catch {}
  }
  if (isEmpty) {
    const p = document.createElement("p");
    p.className = "bubbles-vr-placeholder";
    p.textContent = "Add nodes and press [VR] to generate QR code.";
    container.appendChild(p);
    return;
  }
  try {
    console.log("QR payload (" + text.length + " bytes): " + text);
    const canvas = document.createElement("canvas");
    const qrSize = 512;
    await toCanvas(canvas, text, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: "L",
    });
    canvas.removeAttribute("style"); // let CSS control display size; qrcode sets inline width/height which breaks max-width
    container.appendChild(canvas);

    if (opts.autoDownload && typeof opts.getExportFilenameBase === "function") {
      const filename = "QR-" + opts.getExportFilenameBase("png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  } catch (err) {
    console.error("QR generation failed:", err);
    const p = document.createElement("p");
    p.className = "bubbles-vr-error";
    p.textContent = "QR generation failed.";
    container.appendChild(p);
  }
}
