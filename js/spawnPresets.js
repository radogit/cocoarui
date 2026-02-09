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
      });
    }
  }
  return presets;
}

/**
 * Combined presets: reuse entries from multiple sources (e.g. Power from VR1–VR4).
 * - uiButtonColour: colour of the spawn button.
 * - nodeColour (preset/entry): fill colour for nodes; cascade entry > preset > dataset. Heatmaps use node.color.
 * - nodeFill (preset/entry): optional SVG fill for the node circle (e.g. "url(#diag-hatch)"). Overrides colour for circle only; cascade entry > preset. Omit to use nodeColour/color.
 */
const combinedPresets = [
    { id: "power-all", label: "Power (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#e88",
      entries: [
        { sourceId: "PPD", entryName: "Power-PP-descent", nodeColour: "#00f" },
        { sourceId: "PPA", entryName: "Power-PP-ascent", nodeColour: "#f00" },
        { sourceId: "VR1", entryName: "type-power", nodeColour: "#ff8000", nodeFill: "url(#diag-hatch-orange)" },
        { sourceId: "VR2", entryName: "type-power", nodeColour: "#ff8000" },
        { sourceId: "VR3", entryName: "type-power", nodeColour: "#900090", nodeFill: "url(#diag-hatch-purple)" },
        { sourceId: "VR4", entryName: "type-power", nodeColour: "#900090" },
      ] 
    },
    { id: "distance-all", label: "Distance (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#8e8",
      entries: [
        { sourceId: "PPD", entryName: "Distance-PP-descent", nodeColour: "#00f" },
        { sourceId: "PPA", entryName: "Distance-PP-ascent", nodeColour: "#f00" },
        { sourceId: "VR1", entryName: "type-distance", nodeColour: "#ff8000", nodeFill: "url(#diag-hatch-orange)" },
        { sourceId: "VR2", entryName: "type-distance", nodeColour: "#ff8000" },
        { sourceId: "VR3", entryName: "type-distance", nodeColour: "#900090", nodeFill: "url(#diag-hatch-purple)" },
        { sourceId: "VR4", entryName: "type-distance", nodeColour: "#900090" },
      ] 
    },
    { id: "layout-PPD", label: "Layout (PPD)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#0000ff", nodeColour: "#00f", 
      entries: [
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-navigation"},
        { sourceId: "VR1", entryName: "type-distance"},
        { sourceId: "VR1", entryName: "type-heartrate"},
        { sourceId: "VR1", entryName: "type-power"},
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-gradient"},
        { sourceId: "VR1", entryName: "type-navigation"},
      ] 
    },
    { id: "layout-PPA", label: "Layout (PPA)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff0000", nodeColour: "#f00", 
      entries: [
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-navigation"},
        { sourceId: "VR1", entryName: "type-distance"},
        { sourceId: "VR1", entryName: "type-heartrate"},
        { sourceId: "VR1", entryName: "type-power"},
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-gradient"},
        { sourceId: "VR1", entryName: "type-navigation"},
      ] 
    },
    { id: "layout-VR1", label: "Layout (VR1)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", nodeFill: "url(#diag-hatch-orange)",
      entries: [
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-navigation"},
        { sourceId: "VR1", entryName: "type-distance"},
        { sourceId: "VR1", entryName: "type-heartrate"},
        { sourceId: "VR1", entryName: "type-power"},
        { sourceId: "VR1", entryName: "type-speed"},
        { sourceId: "VR1", entryName: "type-gradient"},
        { sourceId: "VR1", entryName: "type-navigation"},
      ] 
    },
    { id: "layout-VR2", label: "Layout (VR2)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", 
      entries: [
        { sourceId: "VR2", entryName: "type-speed"},
        { sourceId: "VR2", entryName: "type-navigation"},
        { sourceId: "VR2", entryName: "type-distance"},
        { sourceId: "VR2", entryName: "type-power"},
        { sourceId: "VR2", entryName: "type-heartrate"},
        { sourceId: "VR2", entryName: "type-speed"},
        { sourceId: "VR2", entryName: "type-gradient"},
        { sourceId: "VR2", entryName: "type-navigation"},
        { sourceId: "VR2", entryName: "type-time"},
      ] 
    },
    { id: "layout-VR3", label: "Layout (VR3)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", nodeFill: "url(#diag-hatch-purple)",
      entries: [
        { sourceId: "VR3", entryName: "type-speed"},
        { sourceId: "VR3", entryName: "type-power"},
        { sourceId: "VR3", entryName: "type-distance"},
        { sourceId: "VR3", entryName: "type-navigation"},
        { sourceId: "VR3", entryName: "type-heartrate"},
        { sourceId: "VR3", entryName: "type-gradient"},
        { sourceId: "VR3", entryName: "type-speed"},
        { sourceId: "VR3", entryName: "type-power"},
        { sourceId: "VR3", entryName: "type-time"},
      ] 
    },
    { id: "layout-VR4", label: "Layout (VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", 
      entries: [
        { sourceId: "VR4", entryName: "type-speed"},
        { sourceId: "VR4", entryName: "type-power"},
        { sourceId: "VR4", entryName: "type-distance"},
        { sourceId: "VR4", entryName: "type-navigation"},
        { sourceId: "VR4", entryName: "type-heartrate"},
        { sourceId: "VR4", entryName: "type-gradient"},
        { sourceId: "VR4", entryName: "type-speed"},
        { sourceId: "VR4", entryName: "type-power"},
        { sourceId: "VR4", entryName: "type-time"},
      ] 
    },

];

/** All spawn presets: per-source entries plus combined groups. Each preset = one button. */
export const spawnPresets = [...buildPresetsFromSources(), ...combinedPresets];

/**
 * Resolve a preset to a single flat array of node objects (cloned) for dripSpawnSmart.
 * Missing entries are skipped; if all missing, returns [].
 * Node colour cascade: entry.nodeColour > preset.nodeColour > node’s original color from dataset.
 * Node fill cascade: entry.nodeFill > preset.nodeFill; when set, node.fill is used for the circle (e.g. "url(#diag-hatch)").
 */
export function getNodesForPreset(preset) {
  const presetNodeColour = preset.nodeColour;
  const presetNodeFill = preset.nodeFill;
  const nodes = [];
  for (const entryRef of preset.entries) {
    const { sourceId, entryName, nodeColour: entryNodeColour, nodeFill: entryNodeFill } = entryRef;
    const effectiveColour = entryNodeColour != null ? entryNodeColour : presetNodeColour;
    const effectiveFill = entryNodeFill != null ? entryNodeFill : presetNodeFill;
    const entry = getEntry(sourceId, entryName);
    if (!entry || !Array.isArray(entry.nodes)) continue;
    const cloned = structuredClone(entry.nodes);
    cloned.forEach((n) => {
      if (effectiveColour != null) n.color = effectiveColour;
      if (effectiveFill != null) n.fill = effectiveFill;
    });
    nodes.push(...cloned);
  }
  return nodes;
}
