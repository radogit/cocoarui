// exportSquareSVG("figure.svg");
// exportSquarePNG("figure.png");
// exportSquarePNG("figure-4x.png", 4); // publication-quality

import { STYLE_SVG_CSS } from "./style-svg-css.js";
import { SETTINGS_PARAMS } from "./settings.js";
import * as AppUI from "./ui.js";

/**
 * Build export filename base: YYYYMMDD-HHMM_<param values>.
 * @param {string} [extension] - e.g. "svg", "png"
 * @param {Object} [opts] - { sequenceMode } for sequence param
 */
export function getExportFilenameBase(extension, opts = {}) {
  const now = new Date();
  const datePart =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");
  const params = new URLSearchParams(window.location.search);
  const collisionVal = params.get(SETTINGS_PARAMS.collision);
  const collisionStr = collisionVal === "0" || collisionVal === "false" ? "nocol" : "col";
  const sequenceStr = params.get(SETTINGS_PARAMS.sequence) || opts.sequenceMode || "fixing";
  const spawnStr = params.get(SETTINGS_PARAMS.spawn) || "-";
  const bgStr = params.get(SETTINGS_PARAMS.background) || "-";

  const parts = [datePart, spawnStr, collisionStr, sequenceStr];
  const viewToggles = [
    AppUI.showNodeLabel,
    AppUI.showCoordinates,
    AppUI.showForceArrows,
    AppUI.showForceArrowsLabels,
    AppUI.showObservations,
    AppUI.showNodeLines,
    AppUI.showBackground,
    AppUI.showWindStress,
    AppUI.showWindNetForceArrows,
    AppUI.showCircles,
    AppUI.showNodeIcon,
    AppUI.showAxis,
    AppUI.showHorizontalGrid,
    AppUI.showVerticalGrid,
  ];
  viewToggles.forEach((setting) => {
    const str = setting.boolState ? setting.filenameStringOn ?? "" : setting.filenameStringOff ?? "";
    if (!str) return;
    if (str === "__bg__") {
      if (bgStr) parts.push(bgStr);
      return;
    }
    parts.push(str);
  });
  const base = parts.join("_");
  return extension ? `${base}.${String(extension).replace(/^\./, "")}` : base;
}

// =======================================
//  Embed style-svg.css into cloned SVG so export matches screen (font, .id-label, etc.)
//  Prefer fetch from the page's stylesheet URL (works with Parcel hashed filenames);
//  if that returns HTML (SPA fallback) or fails, use bundled STYLE_SVG_CSS.
//  For PNG export at scale > 1, pass { scale } so every px value in the CSS is
//  multiplied by scale (keeps text-shadow, font-size etc. proportional).
//  stroke-width and stroke-dasharray are excluded: in SVG they use user coordinates
//  and already scale with the viewport; scaling them again makes PNG export strokes thicker.
// =======================================
function scalePxInCss(css, scale) {
  if (scale == null || scale === 1) return css;
  return css.replace(/(\d+(?:\.\d+)?)px/g, (match, n, offset) => {
    const before = css.slice(Math.max(0, offset - 80), offset);
    if (/stroke-width\s*:\s*[\d.]*\s*$|stroke-dasharray\s*:\s*[\d.\s]*$/.test(before))
      return match;
    return Math.round(parseFloat(n) * scale * 100) / 100 + "px";
  });
}

async function embedSvgStyles(svgClone, options = {}) {
  let css = STYLE_SVG_CSS;
  const link = document.querySelector('link[href*="style-svg"]');
  const url = link ? link.getAttribute("href") : "style-svg.css";
  try {
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text.trim() && !text.trimStart().startsWith("<")) {
        css = text;
      }
    }
  } catch (_) {
    /* use bundled STYLE_SVG_CSS */
  }
  const scale = options.scale;
  if (scale != null && scale !== 1) {
    css = scalePxInCss(css, scale);
  }
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.setAttribute("type", "text/css");
  style.textContent = css;
  svgClone.insertBefore(style, svgClone.firstChild);
}

// =======================================
//  EXPORT CLEAN SVG  (only visible nodes)
// =======================================
window.exportSVG = async function (filename = "export.svg") {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("No <svg> found on page.");
    return;
  }

  const clone = svg.cloneNode(true);

  const isHidden = (el) => {
    const style = window.getComputedStyle(el);
    return (
      style.display === "none" ||
      style.visibility === "hidden" ||
      el.classList.contains("hidden")
    );
  };
  const prune = (el) => {
    [...el.children].forEach((child) => {
      if (isHidden(child)) child.remove();
      else prune(child);
    });
  };
  prune(clone);

  await embedSvgStyles(clone);

  const svgBlob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  console.log("SVG exported:", filename);
};


// ==================================================
// Helper: Inline computed CSS styles into the SVG
// ==================================================
function inlineComputedStyles(svgEl) {
    const all = svgEl.querySelectorAll("*");
    all.forEach(el => {
        const computed = getComputedStyle(el);
        const style = [];

        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            const val = computed.getPropertyValue(prop);

            // only include relevant SVG properties (prevents bloat)
            if (prop.startsWith("stroke") ||
                prop.startsWith("fill") ||
                prop.startsWith("opacity") ||
                prop.startsWith("font") ||
                prop.startsWith("text") ||
                prop.startsWith("marker") ||
                prop.startsWith("visibility")) {
                style.push(`${prop}:${val}`);
            }
        }

        if (style.length > 0) {
            el.setAttribute("style", style.join(";"));
        }
    });
}

window.exportCroppedSVG = async function (filename = "export.svg") {
  const svg = document.querySelector("svg");
  const container = document.querySelector("g.container");

  if (!svg || !container) {
    console.error("Missing <svg> or <g class='container'>");
    return;
  }

  const clone = svg.cloneNode(true);
  const bbox = container.getBBox();

  clone.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
  clone.setAttribute("width", bbox.width);
  clone.setAttribute("height", bbox.height);

  await embedSvgStyles(clone);

  const blob = new Blob([clone.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  console.log("Cropped SVG exported:", filename);
};

window.exportPNG = async function (filename = "export.png", scale = 1) {
  const svg = document.querySelector("svg");
  const container = document.querySelector("g.container");

  if (!svg || !container) {
    console.error("Missing <svg> or <g class='container'>");
    return;
  }

  const bbox = container.getBBox();
  const clone = svg.cloneNode(true);
  clone.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
  const w = bbox.width * scale;
  const h = bbox.height * scale;
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);

  await embedSvgStyles(clone, { scale });

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(pngUrl);
    });
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

// Unified helper: inline the important computed styles so exported SVG/PNG
// looks like what you see in the browser (including bold + text-shadow).
function inlineComputedStyles(svgEl) {
  svgEl.querySelectorAll("*").forEach(el => {
    const cs = getComputedStyle(el);
    const keep = [];

    for (let i = 0; i < cs.length; i++) {
      const prop = cs[i];
      if (
        prop.startsWith("fill") ||
        prop.startsWith("stroke") ||
        prop.startsWith("opacity") ||
        prop.startsWith("font") ||
        prop.startsWith("marker") ||
        prop.startsWith("text")      // e.g. text-shadow
      ) {
        keep.push(`${prop}:${cs.getPropertyValue(prop)}`);
      }
    }

    if (keep.length) {
      el.setAttribute("style", keep.join(";"));
    }
  });
}
function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  a.remove();
}

function removeHiddenElements(svgEl) {
  const all = Array.from(svgEl.querySelectorAll("*"));

  all.forEach(el => {
    // If this element OR any ancestor has `.hidden`
    if (el.closest(".hidden")) {
      el.remove();
    }
  });
}

async function inlineSvgImages(svg) {
  const images = Array.from(svg.querySelectorAll("image"));

  await Promise.all(images.map(async img => {
    const href =
      img.getAttribute("href") ||
      img.getAttributeNS("http://www.w3.org/1999/xlink", "href");

    if (!href || href.startsWith("data:")) return;

    const res = await fetch(href);
    const blob = await res.blob();

    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    img.setAttribute("href", dataUrl);
  }));
}

window.exportSquareSVG = async function (filename = "export-square.svg") {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("SVG not found");
    return;
  }

  // Prefer viewBox if defined, otherwise fallback to layout size
  const vb = svg.viewBox.baseVal;
  const width  = vb && vb.width  ? vb.width  : svg.clientWidth;
  const height = vb && vb.height ? vb.height : svg.clientHeight;

  const size = Math.min(width, height);

  // Center crop
  const x = (width  - size) / 2;
  const y = (height - size) / 2;

  const clone = svg.cloneNode(true);

  clone.setAttribute("viewBox", `${x} ${y} ${size} ${size}`);
  clone.setAttribute("width",  size);
  clone.setAttribute("height", size);

  removeHiddenElements(clone);
  await inlineSvgImages(clone);
  await embedSvgStyles(clone);

  const blob = new Blob(
    [clone.outerHTML],
    { type: "image/svg+xml;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);

  console.log(`✓ Exported square SVG (${size}×${size})`);
};

window.exportSquarePNG = async function (
  filename = "export-square.png",
  scale = 1
) {
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("SVG not found");
    return;
  }

  const vb = svg.viewBox.baseVal;
  const width  = vb && vb.width  ? vb.width  : svg.clientWidth;
  const height = vb && vb.height ? vb.height : svg.clientHeight;

  const size = Math.min(width, height);
  const x = (width  - size) / 2;
  const y = (height - size) / 2;

  const clone = svg.cloneNode(true);
  clone.setAttribute("viewBox", `${x} ${y} ${size} ${size}`);
  const pixelSize = size * scale;
  clone.setAttribute("width",  pixelSize);
  clone.setAttribute("height", pixelSize);

  removeHiddenElements(clone);
  await inlineSvgImages(clone);
  await embedSvgStyles(clone, { scale });

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = pixelSize;
      canvas.height = pixelSize;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(blob => {
        const pngUrl = URL.createObjectURL(blob);
        triggerDownload(pngUrl, filename);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
        resolve();
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG for PNG export"));
    };
    img.src = url;
  });
};

// =======================================
//  EXPORT METRICS AS CSV  (same columns as metrics panel)
// =======================================
/**
 * Compute per-node metrics (sum |F|, |ΣF|, cancel) like updateMetrics in script.js.
 */
function computeNodeMetrics(node) {
  const F = node.forces ?? [];
  const sum = F.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0);
  const netx = F.reduce((s, f) => s + f.fx, 0);
  const nety = F.reduce((s, f) => s + f.fy, 0);
  const net = Math.hypot(netx, nety);
  return {
    _sumF: sum,
    _netF: net,
    _cancel: sum - net
  };
}

function escapeCsvCell(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Export nodes as CSV with columns: entryName, nodeLabel, x, y, diameter, Σ|F|, |ΣF|, cancel, vx, vy.
 * Uses scaleUnit to convert x/y/diameter to data coordinates.
 */
window.exportMetricsCSV = function (filename = "bubblesMetrics.csv", nodes, scaleUnit) {
  if (!nodes || !nodes.length) {
    console.warn("No nodes to export as CSV");
    return;
  }

  const header = ["entryName", "nodeLabel", "x", "y", "diameter", "Σ|F|", "|ΣF|", "cancel", "vx", "vy"];
  const rows = nodes.map(d => {
    const m = computeNodeMetrics(d);
    const x = scaleUnit != null ? (d.x / scaleUnit).toFixed(0) : String(d.x);
    const y = scaleUnit != null ? (-d.y / scaleUnit).toFixed(0) : String(-d.y);
    const diameter = scaleUnit != null ? (2 * (d.radius ?? 0) / scaleUnit).toFixed(0) : String(2 * (d.radius ?? 0));
    const entryName = d.entryName ?? "";
    const nodeLabel = d.displayLabel != null ? d.displayLabel : d.id;
    return [
      entryName,
      nodeLabel,
      x,
      y,
      diameter,
      m._sumF.toFixed(1),
      m._netF.toFixed(1),
      m._cancel.toFixed(1),
      (d.vx ?? 0).toFixed(1),
      (d.vy ?? 0).toFixed(1)
    ].map(escapeCsvCell);
  });

  const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
  console.log("CSV exported:", filename, rows.length, "rows");
};

// =======================================
//  EXPORT LAYOUT AS JSON  (dataset format for datasetsLayouts.js)
// =======================================
/**
 * Export current nodes as JSON in dataset format. Each node gets a single square hotspot
 * at its current position with area = π*r², so the layout can be re-imported into datasetsLayouts.
 * Coordinates and dimensions are in universal (degree) units; y is stored with positive = UP.
 * @param {string} filename - e.g. "layout.json"
 * @param {Array} nodes - Datasets.nodes (simulation coords: pixels, y-down)
 * @param {number} scaleUnit - pixels per data unit; divide sim values by this for storage
 */
window.exportLayoutJSON = function (filename = "layout.json", nodes, scaleUnit) {
  if (!nodes || !nodes.length) {
    console.warn("No nodes to export as JSON");
    return;
  }
  const sqrtPi = Math.sqrt(Math.PI);
  const su = scaleUnit != null && scaleUnit !== 0 ? scaleUnit : 1;
  const entries = nodes.map((n) => {
    const r = n.radius ?? 0;
    const rData = r / su;
    const side = rData * sqrtPi; // square with area π*r² in data units
    const xData = n.x / su;
    const yData = -n.y / su; // flip y: stored as positive-up for import
    const shorthand = n.sourceId ?? "layout";
    const nodeLabel = n.displayLabel ?? n.id;
    const exportedId = shorthand + "-" + nodeLabel;
    return {
      name: exportedId,
      nodes: [
        {
          id: exportedId,
          representation: n.representation ?? "number",
          x: xData,
          y: yData,
          color: n.color,
          radius: 0,
          isFixed: true,
          significance: n.significance ?? 100,
          hotspots: [
            {
              name: nodeLabel,
              x: xData,
              y: yData,
              intensityFactor: 1,
              width: side,
              height: side,
              forceType: "attract"
            }
          ]
        }
      ]
    };
  });
  const json = JSON.stringify(entries, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
  console.log("Layout JSON exported:", filename, entries.length, "entries");
};
