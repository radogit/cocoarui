/**
 * Dataset/spawn registry (background-style).
 * - datasetSources: individual sources (each is an array of { name, nodes, ... }).
 * - spawnPresets: groups that reference one or more entries from sources; can combine e.g. "Power" from VR1+VR2+VR3+VR4.
 * Spawn buttons are built from spawnPresets; each preset becomes one button that spawns the combined nodes.
 */

import * as Datasets from "./datasets.js";
import * as DatasetsPPD from "../personal/datasetsPPD.js";
import * as DatasetsPPA from "../personal/datasetsPPA.js";
import * as DatasetsVR1 from "../personal/datasetsVR1.js";
import * as DatasetsVR2 from "../personal/datasetsVR2.js";
import * as DatasetsVR3 from "../personal/datasetsVR3.js";
import * as DatasetsVR4 from "../personal/datasetsVR4.js";

/** Map sourceId -> array of { name, nodes, uiButtonColour?, ... } (same shape as current preppedNodes). */
export const datasetSources = {
  Demo: Datasets.preppedNodesDemoSamples,
  PPD: DatasetsPPD.preppedNodesPPD,
  PPA: DatasetsPPA.preppedNodesPPA,
  VR1: DatasetsVR1.preppedNodesVR1,
  VR2: DatasetsVR2.preppedNodesVR2,
  VR3: DatasetsVR3.preppedNodesVR3,
  VR4: DatasetsVR4.preppedNodesVR4,
  KeepFree: Datasets.preppedNodesKeepFreeSamples,
};

/** Map sourceId -> { hotspotName: divisor }. Used to divide hotspot force by divisor; missing name = 1. */
const sourceForceDivisor = {
  PPA: DatasetsPPA.hotspotForceDivisor ?? {},
  PPD: DatasetsPPD.hotspotForceDivisor ?? {},
};

/** Which spawn panel (container id) each source’s entries go into by default. */
const sourceToPanelId = {
  Demo: "spawnButtonContainerDemoSamples",
  PPD: "spawnButtonContainerPPD",
  PPA: "spawnButtonContainerPPA",
  VR1: "spawnButtonContainerVR1",
  VR2: "spawnButtonContainerVR2",
  VR3: "spawnButtonContainerVR3",
  VR4: "spawnButtonContainerVR4",
  KeepFree: "spawnButtonContainerKeepFreeSamples",
};

/**
 * Get one entry from a source by entry name.
 * @param {string} sourceId - key in datasetSources
 * @param {string} entryName - item.name in that array
 * @returns {{ name, nodes, ... } | undefined}
 */
export function getEntry(sourceId, entryName) {
  const arr = datasetSources[sourceId];
  if (!arr || !Array.isArray(arr)) return undefined;
  return arr.find((item) => item.name === entryName);
}

/** Build one preset per entry in each source (so we don’t hardcode every PPD/PPA/VR entry name). */
function buildPresetsFromSources() {
  const presets = [];
  for (const [sourceId, arr] of Object.entries(datasetSources)) {
    if (!Array.isArray(arr)) continue;
    const panelId = sourceToPanelId[sourceId];
    for (const entry of arr) {
      const id = `${sourceId}-${String(entry.name).replace(/\s+/g, "-")}`;
      presets.push({
        id,
        label: entry.name,
        panelId,
        uiButtonColour: entry.uiButtonColour,
        entries: [{ sourceId, entryName: entry.name }],
        ...(entry.description != null && { description: entry.description }),
      });
    }
  }
  return presets;
}

/**
 * Combined presets: reuse entries from multiple sources (e.g. Power from VR1–VR4).
 * - uiButtonColour: colour of the spawn button.
 * - nodeColour (preset/entry): fill colour for nodes; cascade entry > preset > dataset. Heatmaps use node.color.
 * - nodeFill (preset/entry): optional SVG fill for the node circle (e.g. "url(#diag-hatch)"); cascade entry > preset.
 * - nodeLabel (preset/entry): optional display name for the node id-label (instead of node.id); cascade entry > preset.
 * - links: optional array of { fromLabel, toLabel, color? }. color is a colour name (e.g. "red", "blue") from the app palette; arrow stroke and arrowhead use it.
 * - description: optional string; when preset is spawned, the Description panel is shown beneath Favourites with this content. If absent, no panel.
 */
const combinedPresets = [
    { id: "power-all", label: "Power (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      description: "Power type comparison across Paper Pano (descent/ascent) and VR (standing/cycling). Orange = descent, purple = ascent.",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Power-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Power-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-power", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-power", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-power", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-power", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "distance-all", label: "Distance (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Distance-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Distance-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-distance", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-distance", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-distance", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-distance", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "navigation-all", label: "Navigation (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Navigation-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Navigation-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-navigation", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-navigation", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-navigation", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-navigation", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "heartrate-all", label: "Heartrate (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Heartrate-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Heartrate-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-heartrate", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-heartrate", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-heartrate", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-heartrate", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "speed-all", label: "Speed (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Speed-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Speed-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-speed", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-speed", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-speed", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-speed", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "gradient-all", label: "Gradient (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Gradient-PP-descent", nodeColour: "#00f", nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Gradient-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-gradient", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-gradient", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-gradient", nodeColour: "#900090"  , nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-gradient", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "time-all", label: "Time (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Time-PP-descent", nodeColour: "#00f", nodeLabel: "PPD"},
        { sourceId: "PPA", entryName: "Time-PP-ascent", nodeColour: "#f00", nodeLabel: "PPA"},
        { sourceId: "VR1", entryName: "type-time", nodeColour: "#ff8000", nodeLabel: "VR1", nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-time", nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-time", nodeColour: "#900090", nodeLabel: "VR3", nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-time", nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "layout-PPD", label: "Layout (Paper Pano Descent) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#66f", nodeColour: "#00f", 
      entries: [
        { sourceId: "PPD", entryName: "Speed-PP-descent", nodeLabel: "speed"},
        { sourceId: "PPD", entryName: "Distance-PP-descent", nodeLabel: "distance"},
        { sourceId: "PPD", entryName: "Navigation-PP-descent", nodeLabel: "navigation"},
        { sourceId: "PPD", entryName: "Speed-PP-descent", nodeLabel: "speed"},
        { sourceId: "PPD", entryName: "Time-PP-descent", nodeLabel: "time"},
        { sourceId: "PPD", entryName: "Power-PP-descent", nodeLabel: "power"},
        { sourceId: "PPD", entryName: "Distance-PP-descent", nodeLabel: "distance"},
        { sourceId: "PPD", entryName: "Heartrate-PP-descent", nodeLabel: "heartrate"},
      ] 
    },
    { id: "layout-PPA", label: "Layout (Paper Pano Ascent) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff0000", nodeColour: "#f00", 
      entries: [
        { sourceId: "PPA", entryName: "Speed-PP-ascent", nodeLabel: "speed"},
        { sourceId: "PPA", entryName: "Distance-PP-ascent", nodeLabel: "distance"},
        { sourceId: "PPA", entryName: "Navigation-PP-ascent", nodeLabel: "navigation"},
        { sourceId: "PPA", entryName: "Power-PP-ascent", nodeLabel: "power"},
        { sourceId: "PPA", entryName: "Time-PP-ascent", nodeLabel: "time"},
        { sourceId: "PPA", entryName: "Gradient-PP-ascent", nodeLabel: "gradient"},
        { sourceId: "PPA", entryName: "Heartrate-PP-ascent", nodeLabel: "heartrate"},
        { sourceId: "PPA", entryName: "Speed-PP-ascent", nodeLabel: "speed"},
        { sourceId: "PPA", entryName: "Distance-PP-ascent", nodeLabel: "distance"},
        { sourceId: "PPA", entryName: "Navigation-PP-ascent", nodeLabel: "navigation"},
      ] 
    },
    { id: "layout-VR1", label: "Layout (VR1) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", nodeFill: "url(#diag-hatch-orange)",
      entries: [
        { sourceId: "VR1", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR1", entryName: "type-navigation", nodeLabel: "navigation" },
        { sourceId: "VR1", entryName: "type-distance", nodeLabel: "distance" },
        { sourceId: "VR1", entryName: "type-heartrate", nodeLabel: "heartrate" },
        { sourceId: "VR1", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR1", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR1", entryName: "type-gradient", nodeLabel: "gradient" },
        { sourceId: "VR1", entryName: "type-navigation", nodeLabel: "navigation" },
      ] 
    },
    { id: "layout-VR2", label: "Layout (VR2) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", 
      entries: [
        { sourceId: "VR2", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR2", entryName: "type-navigation", nodeLabel: "navigation" },
        { sourceId: "VR2", entryName: "type-distance", nodeLabel: "distance" },
        { sourceId: "VR2", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR2", entryName: "type-heartrate", nodeLabel: "heartrate" },
        { sourceId: "VR2", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR2", entryName: "type-gradient", nodeLabel: "gradient" },
        { sourceId: "VR2", entryName: "type-navigation", nodeLabel: "navigation" },
        { sourceId: "VR2", entryName: "type-time", nodeLabel: "time" },
      ] 
    },
    { id: "layout-VR3", label: "Layout (VR3) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", nodeFill: "url(#diag-hatch-purple)",
      entries: [
        { sourceId: "VR3", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR3", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR3", entryName: "type-distance", nodeLabel: "distance" },
        { sourceId: "VR3", entryName: "type-navigation", nodeLabel: "navigation" },
        { sourceId: "VR3", entryName: "type-heartrate", nodeLabel: "heartrate" },
        { sourceId: "VR3", entryName: "type-gradient", nodeLabel: "gradient" },
        { sourceId: "VR3", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR3", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR3", entryName: "type-time", nodeLabel: "time" },
      ] 
    },
    { id: "layout-VR4", label: "Layout (VR4) (AAM)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", 
      entries: [
        { sourceId: "VR4", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR4", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR4", entryName: "type-distance", nodeLabel: "distance" },
        { sourceId: "VR4", entryName: "type-navigation", nodeLabel: "navigation" },
        { sourceId: "VR4", entryName: "type-heartrate", nodeLabel: "heartrate" },
        { sourceId: "VR4", entryName: "type-gradient", nodeLabel: "gradient" },
        { sourceId: "VR4", entryName: "type-speed", nodeLabel: "speed" },
        { sourceId: "VR4", entryName: "type-power", nodeLabel: "power" },
        { sourceId: "VR4", entryName: "type-time", nodeLabel: "time" },
      ] 
    },

];

/** All spawn presets: per-source entries plus combined groups. Each preset = one button. */
export const spawnPresets = [...buildPresetsFromSources(), ...combinedPresets];

/**
 * Resolve a preset to a single flat array of node objects (cloned) for dripSpawnSmart.
 * Missing entries are skipped; if all missing, returns [].
 * - Node colour cascade: entry.nodeColour > preset.nodeColour > node’s original color from dataset.
 * - Node fill cascade:   entry.nodeFill   > preset.nodeFill; when set, node.fill is used for the circle (e.g. "url(#diag-hatch)").
 * - Node label cascade:  entry.nodeLabel > preset.nodeLabel; when set, node.displayLabel is used for the id-label text instead of node.id.
 *
 * NOTE: Links should refer to either the node’s original id or its nodeLabel
 * (which becomes displayLabel), there is no separate displayLabel field.
 *
 * Node radius from hotspots (area-based, with split attribution):
 * - Per rectangle: effective area = (intensityFactor / divisor) * width * height.
 *   divisor from hotspotForceDivisor lookup (or 1); divisor 0 → contribution 0.
 * - Average these effective areas over the node's hotspots.
 * - Radius of an equivalent circle: radius = sqrt(avgArea / π).
 * No hotspots → 0.
 */
function radiusFromHotspots(node) {
  if (!node.hotspots || !node.hotspots.length) return 0;
  let sumEffectiveArea = 0;
  for (const h of node.hotspots) {
    const div = (node.hotspotForceDivisor && node.hotspotForceDivisor[h.name]) ?? 1;
    const fraction = div > 0 ? (h.intensityFactor ?? 1) / div : 0;
    sumEffectiveArea += fraction * h.width * h.height;
  }
  const avgArea = sumEffectiveArea / node.hotspots.length;
  return Math.sqrt(avgArea / Math.PI);
}

export function getNodesForPreset(preset) {
  const presetNodeColour = preset.nodeColour;
  const presetNodeFill = preset.nodeFill;
  const presetNodeLabel = preset.nodeLabel;
  const nodes = [];
  for (const entryRef of preset.entries) {
    const {
      sourceId,
      entryName,
      nodeColour: entryNodeColour,
      nodeFill: entryNodeFill,
      nodeLabel: entryNodeLabel,
    } = entryRef;
    const effectiveColour = entryNodeColour != null ? entryNodeColour : presetNodeColour;
    const effectiveFill = entryNodeFill != null ? entryNodeFill : presetNodeFill;
    const effectiveLabel = entryNodeLabel != null ? entryNodeLabel : presetNodeLabel;
    const entry = getEntry(sourceId, entryName);
    if (!entry || !Array.isArray(entry.nodes)) continue;
    const cloned = structuredClone(entry.nodes);
    const forceDivisor = sourceForceDivisor[sourceId] ?? {};
    cloned.forEach((n) => {
      if (effectiveColour != null) n.color = effectiveColour;
      if (effectiveFill != null) n.fill = effectiveFill;
      if (effectiveLabel != null) {
        // nodeLabel (entry or preset) controls what you see on the node
        // and what link labels should refer to.
        n.displayLabel = effectiveLabel;
      }
      n.entryName = entryName;
      n.hotspotForceDivisor = forceDivisor;
      const hardcoded = n.radius;
      const calculated = radiusFromHotspots(n);
      n.radius = calculated;
      const match = Math.abs(calculated - hardcoded) < 1e-6;
      console.log(`[spawn] ${n.id}: radius calculated=${calculated.toFixed(4)} hardcoded=${hardcoded} ${match ? "match" : "DIFF"}`);
    });
    nodes.push(...cloned);
  }
  return nodes;
}
