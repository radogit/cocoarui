import * as d3 from "d3";
import * as Datasets from "./js/datasets.js";
import * as DatasetsVR1 from "./personal/datasetsVR1.js";
import * as DatasetsVR2 from "./personal/datasetsVR2.js";
import * as DatasetsVR3 from "./personal/datasetsVR3.js";
import * as DatasetsVR4 from "./personal/datasetsVR4.js";
import * as DatasetsPPD from "./personal/datasetsPPD.js";
import * as DatasetsPPA from "./personal/datasetsPPA.js";
import * as Forces from "./js/forces.js";
import * as Drawing from "./js/drawing.js";
import * as Heatmaps from "./js/heatmaps.js";
import * as AppUI from "./js/ui.js";
import { setupLogger } from './js/logger.js';
import * as Exporter from './js/exporter.js';
import { getExportFilenameBase as getExportFilenameBaseFromExporter } from './js/exporter.js';
import { imagePaths, backgroundPresets, createBackgroundAppliers } from './js/backgrounds.js';
import { spawnPresets, getNodesForPreset } from './js/spawnPresets.js';
import { colours } from './js/colours.js';
import { SETTINGS_PARAMS, updateSettingsURLParam, setupSettingsPanel } from './js/settings.js';
import { createNodeSpawn, clearSpawnQueue } from './js/nodeSpawn.js';
import { setupListeners } from './js/listeners.js';
import { createMetricsUpdater } from './js/metrics.js';
import { addDefaultHatchPatterns } from './js/patterns.js';
import { createOnResize } from './js/viewport.js';
import { createNodeRendering } from './js/nodeRendering.js';


window.Datasets = Datasets;   // <-- makes Datasets visible in DevTools

// Global-ish setting for sequence behaviour in dripSpawnSmart
// "fixing" → fix node after it settles; "floating" → leave free.
let sequenceMode = "fixing";

// define container for explicit node-to-node links spawned from presets (by label), e.g. 1<-2, 1<-3
// Each entry: { fromLabel: string, toLabel: string }
let activeLinks = [];

// Set up the logger
setupLogger();

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, linkLayer, windLayerCancel, windLayerStress, windLayerNetForceArrows, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();
const onResize = createOnResize(svg, container, minDim);
/** Opacity of other nodes' hotspot groups when hovering a node or its metrics row. Lower = more dimmed. */
const HOTSPOT_OPACITY_OTHERS_ON_HOVER = 0.06;

// build the metrics panel once ──────────────────────────────────────────
const metPanel = d3.select("#metrics-panel")
                   .append("table")
                   .attr("class", "metrics");

metPanel.append("thead").append("tr").selectAll("th")
        .data(["nodeLabel", "fix", "x", "y", "⌀", "Σ|F|", "|ΣF|", "cancel", "vx", "vy"])
        .enter().append("th")
        .text(d => d);

const tbody = metPanel.append("tbody").attr("id","metrics-body");;
const tfoot = metPanel.append("tfoot");

// 2) Draw axes
const { xScale, yScale, xAxis, yAxis } = Drawing.createAxes(container, width, height, minDim);

// 2b) Grid lines every 10 (vertical V, horizontal H)
Drawing.createGridLines(container, xScale, yScale);

// 3) Arrowhead artefacts + shared patterns (e.g. diag-hatch for preset fill)
const defs = svg.append("defs").attr("id","defs").attr("width",100).attr("height",100);
Drawing.createArrowheads(defs, colours);

// Shared hatch patterns for nodeFill (can be referenced as url(#...))
addDefaultHatchPatterns(defs);

// 3+) Backgrounds
//Backgrounds.createBackgroundDefs(defs, scaleUnit);

// 4) Create the gradients by calling the new function
Heatmaps.createHeatmapGradients(defs, Datasets.nodes, colours);

// 5) Then build the hotspot rects, also from the new function
Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

// 6) Set up UI toggles
AppUI.setupUI();


// ================================================================================================================
// =============== SPAWN ===============================================================================
// ================================================================================================================
// buildOrUpdateNodes, ticked moved to js/nodeRendering.js
// addOneSmart moved to js/nodeSpawn.js
// waitForNodeToSettle, clearSpawnQueue, dripSpawnSmart moved to js/nodeSpawn.js
// removeNodeById, removeAllNodes moved to js/nodeSpawn.js (use nodeOps)


// ================================================================================================================
// =============== SIMULATION LOGIC =======================================================================================
// ================================================================================================================

const forceCollide = d3.forceCollide().radius(d => d.radius + Datasets.collisionMargin).strength(1.2); // unchanged from original
const forceRepel = d3.forceManyBody().strength(d => d.isFixed ? 0 : -50); // Mild repulsion between nodes
let collisionEnabled = true;

const simulation = d3.forceSimulation(Datasets.nodes)
    .force('travel', Forces.forceTravel(Datasets.nodes))
    .force("repel", forceRepel)
    .force("collide", forceCollide)
    .force("gaussian", Forces.forceGaussianPreferredArea(1.5, () => collisionEnabled))
    .force("customCollision", Forces.forceCustomCollision);

function setCollisionEnabled(enabled) {
  collisionEnabled = enabled;
  Forces.nodeNodeCollisionInGaussian = enabled;
  simulation.force("repel", enabled ? forceRepel : null);
  simulation.force("collide", enabled ? forceCollide : null);
  simulation.force("customCollision", enabled ? Forces.forceCustomCollision : null);
  simulation.alpha(0.3).restart();
}

// ================================================================================================================
// =============== Dragging & Toggling =======================================================================================
// ================================================================================================================
// dragStart, dragging, dragEnd from js/nodeInteraction.js

function setNodeFixed(node, fixed) {
  node.isFixed = !!fixed;
  if (node.isFixed) {
    node.fx = node.x;
    node.fy = node.y;
  } else {
    node.fx = null;
    node.fy = null;
  }
  const sel = d3.select(`#node-group-${node.id}`).select("circle");
  if (!sel.empty()) {
    sel.classed("node-fixed", node.isFixed);
  }
  simulation.alpha(0.5).restart();
}

function toggleFixed(event, d) {
  setNodeFixed(d, !d.isFixed);
}

const metricsUpdater = createMetricsUpdater({
  tbody,
  tfoot,
  scaleUnit,
  hotspotLayer,
  hotspotOpacityOthersOnHover: HOTSPOT_OPACITY_OTHERS_ON_HOVER,
  setNodeFixed,
});

const { buildOrUpdateNodes, ticked } = createNodeRendering({
  tbody,
  hotspotLayer,
  hotspotOpacityOthersOnHover: HOTSPOT_OPACITY_OTHERS_ON_HOVER,
  linkLayer,
  scaleUnit,
  simulation,
  toggleFixed,
  activeLinks,
  Datasets,
  metricsUpdater,
});
simulation.on("tick", ticked);

// setupDragAndDropForSpawnButtons, button listeners moved to js/listeners.js
const getExportFilenameBase = (ext) => getExportFilenameBaseFromExporter(ext, { sequenceMode });

// Settings panel: URL params and wiring (see js/settings.js)
const urlParams = new URLSearchParams(window.location.search);
const { applyBackgroundSelection, applyBackgroundOpacity } = createBackgroundAppliers(container);

const sequenceModeRef = { get value() { return sequenceMode; }, set value(v) { sequenceMode = v; } };
setupSettingsPanel({
  container,
  urlParams,
  sequenceModeRef,
  setCollisionEnabled,
  backgroundPresets,
  applyBackgroundSelection,
  applyBackgroundOpacity,
});

const nodeOps = createNodeSpawn({
  nodes: Datasets.nodes,
  activeLinks,
  linkLayer,
  hotspotLayer,
  nodeLayer,
  windLayerCancel,
  windLayerStress,
  windLayerNetForceArrows,
  simulation,
  buildOrUpdateNodes,
  defs,
  width,
  height,
  minDim,
  scaleUnit,
  sequenceModeRef,
});

setupListeners({
  nodeOps,
  clearSpawnQueue,
  updateSettingsURLParam,
  SETTINGS_PARAMS,
  getExportFilenameBase,
  Datasets,
  scaleUnit,
  updateDescriptionPanel,
  activeLinks,
  container,
  svg,
  minDim,
  tbody,
  onResize,
});

/**
 * Show or hide the Description panel based on spawn preset description.
 * Call with a truthy string to show the panel and populate it; call with falsy to hide.
 * @param {string|undefined} description - Optional description text (HTML-safe) from preset.description
 */
export function updateDescriptionPanel(description) {
  const panel = document.getElementById("description-panel");
  const content = document.getElementById("description-content");
  if (!panel || !content) return;
  if (description && String(description).trim()) {
    content.innerHTML = String(description).trim();
    panel.classList.remove("hidden");
  } else {
    content.innerHTML = "";
    panel.classList.add("hidden");
  }
}

// buildSpawnButtonsFromPresets, collapse headers moved to js/listeners.js

// Auto-start a spawn preset from URL (e.g. ?spawn=power-all)
const spawnPresetId = urlParams.get(SETTINGS_PARAMS.spawn);
if (spawnPresetId) {
  const preset = spawnPresets.find((p) => p.id === spawnPresetId);
  if (preset) {
    const nodes = getNodesForPreset(preset);
    if (nodes.length) {
      if (Array.isArray(preset.links) && preset.links.length) {
        activeLinks.push(...preset.links);
      }
      updateDescriptionPanel(preset.description);
      nodeOps.dripSpawnSmart(nodes, 1000).then(async () => {
        // After auto-spawn finishes, read current auto-download state from URL (user may have changed checkboxes during spawn).
        const currentParams = new URLSearchParams(window.location.search);
        const autoSvg = currentParams.get(SETTINGS_PARAMS.autoSvg) === "1";
        const autoPng = currentParams.get(SETTINGS_PARAMS.autoPng) === "1";
        const autoCsv = currentParams.get(SETTINGS_PARAMS.autoCsv) === "1";
        const autoJson = currentParams.get(SETTINGS_PARAMS.autoJson) === "1";
        const exportPromises = [];
        if (autoSvg && typeof window.exportSquareSVG === "function") {
          exportPromises.push(window.exportSquareSVG(getExportFilenameBase("svg")));
        }
        if (autoPng && typeof window.exportSquarePNG === "function") {
          exportPromises.push(window.exportSquarePNG(getExportFilenameBase("png"), 4));
        }
        if (autoCsv && typeof window.exportMetricsCSV === "function") {
          exportPromises.push(Promise.resolve().then(() => window.exportMetricsCSV(getExportFilenameBase("csv"), Datasets.nodes, scaleUnit)));
        }
        if (autoJson && typeof window.exportLayoutJSON === "function") {
          exportPromises.push(Promise.resolve().then(() => window.exportLayoutJSON(getExportFilenameBase("json"), Datasets.nodes, scaleUnit)));
        }
        await Promise.all(exportPromises);

        // Fav queue: after downloads complete, advance to next URL or finish
        try {
          const raw = sessionStorage.getItem("favQueue");
          if (raw) {
            const { urls, index } = JSON.parse(raw);
            const nextIndex = index + 1;
            if (nextIndex < urls.length) {
              sessionStorage.setItem("favQueue", JSON.stringify({ urls, index: nextIndex }));
              window.location.href = urls[nextIndex];
            } else {
              sessionStorage.removeItem("favQueue");
              console.log("✓ Fav queue complete");
            }
          }
        } catch (_) {}
      });
    }
  }
}

// Metrics table, tbody, resize, keydown listeners moved to js/listeners.js
