/**
 * BubblesVR: convert D3 layout to VR markers format and generate QR code.
 * The QR payload is parameters-only (JSON markers array), not a URL, so it works
 * across domains and environments.
 */
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
 * Convert D3 nodes to VR markers JSON string.
 * Format matches CardboardVR parseMarkersFromRawString: [{"yaw", "pitch", "size", "color", "name"}]
 * Coordinates in degrees; yaw = x, pitch = -y (D3 y-down → VR y-up).
 * Numerical values rounded to 1 decimal to keep QR code simpler (bigger squares).
 * @param {Array} nodes - Datasets.nodes (simulation coords: pixels, y-down)
 * @param {number} scaleUnit - pixels per data unit
 * @returns {string} - JSON string (no URL)
 */
export function getVRMarkersString(nodes, scaleUnit) {
  if (!nodes || !nodes.length) return "[]";
  const su = scaleUnit != null && scaleUnit !== 0 ? scaleUnit : 1;
  const markers = nodes.map((n) => {
    const r = n.radius ?? 0;
    const yaw = round1(n.x / su);
    const pitch = round1(-n.y / su);
    const size = round1((2 * r) / su);
    const name = n.displayLabel ?? n.id ?? "";
    const color = colorToHex(n.color);
    return { yaw, pitch, size, color, name };
  });
  return JSON.stringify(markers);
}

/**
 * Generate a QR code for the given text and display it in the container.
 * @param {string} text - Payload (e.g. markers JSON)
 * @param {HTMLElement} container - Element to render into (canvas or img appended)
 */
export async function generateQRCode(text, container) {
  if (!container) return;
  container.innerHTML = "";
  if (!text || text === "[]") {
    const p = document.createElement("p");
    p.className = "bubbles-vr-placeholder";
    p.textContent = "Add nodes and press [VR] to generate QR code.";
    container.appendChild(p);
    return;
  }
  try {
    console.log("QR payload (" + text.length + " bytes): " + text);
    const canvas = document.createElement("canvas");
    await toCanvas(canvas, text, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: "L",
    });
    container.appendChild(canvas);
  } catch (err) {
    console.error("QR generation failed:", err);
    const p = document.createElement("p");
    p.className = "bubbles-vr-error";
    p.textContent = "QR generation failed.";
    container.appendChild(p);
  }
}
