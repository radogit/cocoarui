import * as d3 from "d3";
import * as Datasets from "./js/datasets.js";
import { createSimulation } from "./js/simulation.js";
import { createNodeFixedHandlers } from "./js/nodeInteraction.js";
import { createScene } from "./js/scene.js";
import * as AppUI from "./js/ui.js";
import { setupLogger } from './js/logger.js';
import { getExportFilenameBase as getExportFilenameBaseFromExporter } from './js/exporter.js';
import { imagePaths, backgroundPresets, createBackgroundAppliers } from './js/backgrounds.js';
import { spawnPresets, getNodesForPreset } from './js/spawnPresets.js';
import { colours } from './js/colours.js';
import { SETTINGS_PARAMS, updateSettingsURLParam, setupSettingsPanel } from './js/settings.js';
import { createNodeSpawn, clearSpawnQueue } from './js/nodeSpawn.js';
import { setupListeners } from './js/listeners.js';
import { createMetricsUpdater } from './js/metrics.js';
import { createOnResize } from './js/viewport.js';
import { createNodeRendering } from './js/nodeRendering.js';
import { runAutoSpawnFromUrl } from './js/autoSpawn.js';


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

const {
  svg,
  container,
  nodeLayer,
  hotspotLayer,
  linkLayer,
  windLayerCancel,
  windLayerStress,
  windLayerNetForceArrows,
  width,
  height,
  minDim,
  scaleUnit,
  tbody,
  tfoot,
  defs,
} = createScene(Datasets, colours);

const onResize = createOnResize(svg, container, minDim);
/** Opacity of other nodes' hotspot groups when hovering a node or its metrics row. Lower = more dimmed. */
const HOTSPOT_OPACITY_OTHERS_ON_HOVER = 0.06;
// addOneSmart moved to js/nodeSpawn.js
// waitForNodeToSettle, clearSpawnQueue, dripSpawnSmart moved to js/nodeSpawn.js
// removeNodeById, removeAllNodes moved to js/nodeSpawn.js (use nodeOps)

const { simulation, setCollisionEnabled } = createSimulation(Datasets.nodes, {
  collisionMargin: Datasets.collisionMargin,
});

const { setNodeFixed, toggleFixed } = createNodeFixedHandlers(simulation);

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
  updateDescriptionPanel: AppUI.updateDescriptionPanel,
  activeLinks,
  container,
  svg,
  minDim,
  tbody,
  onResize,
});

// buildSpawnButtonsFromPresets, collapse headers moved to js/listeners.js

runAutoSpawnFromUrl(urlParams, {
  SETTINGS_PARAMS,
  spawnPresets,
  getNodesForPreset,
  activeLinks,
  updateDescriptionPanel: AppUI.updateDescriptionPanel,
  nodeOps,
  getExportFilenameBase,
  Datasets,
  scaleUnit,
});
