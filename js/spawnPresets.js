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
 * - Preset-level uiButtonColour: colour of the spawn button.
 * - Per-entry nodeColour (optional): override colour of all nodes from that entry when spawned.
 *   Example: { sourceId: "VR1", entryName: "type-power", nodeColour: "#c00" }
 */
const combinedPresets = [
  { id: "power-all", label: "Power (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#e88",
    entries: [
      { sourceId: "VR1", entryName: "type-power", nodeColour: "#c00" },
      { sourceId: "VR2", entryName: "type-power", nodeColour: "#c00" },
      { sourceId: "VR3", entryName: "type-power", nodeColour: "#c00" },
      { sourceId: "VR4", entryName: "type-power", nodeColour: "#c00" },
      { sourceId: "PPD", entryName: "Power - PP - descent", nodeColour: "#c00" },
      { sourceId: "PPA", entryName: "Power - PP - ascent", nodeColour: "#c00" },
    ] },
    { id: "distance-all", label: "Distance (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#8e8",
      entries: [
        { sourceId: "VR1", entryName: "type-distance", nodeColour: "#0c0" },
        { sourceId: "VR2", entryName: "type-distance", nodeColour: "#0c0" },
        { sourceId: "VR3", entryName: "type-distance", nodeColour: "#0c0" },
        { sourceId: "VR4", entryName: "type-distance", nodeColour: "#0c0" },
        { sourceId: "PPD", entryName: "Distance - PP - descent", nodeColour: "#0c0" },
        { sourceId: "PPA", entryName: "Distance - PP - ascent", nodeColour: "#0c0" },
      ] },
  ];

/** All spawn presets: per-source entries plus combined groups. Each preset = one button. */
export const spawnPresets = [...buildPresetsFromSources(), ...combinedPresets];

/**
 * Resolve a preset to a single flat array of node objects (cloned) for dripSpawnSmart.
 * Missing entries are skipped; if all missing, returns [].
 * If an entry has nodeColour, that colour is applied to every node from that entry.
 */
export function getNodesForPreset(preset) {
  const nodes = [];
  for (const entryRef of preset.entries) {
    const { sourceId, entryName, nodeColour } = entryRef;
    const entry = getEntry(sourceId, entryName);
    if (!entry || !Array.isArray(entry.nodes)) continue;
    const cloned = structuredClone(entry.nodes);
    if (nodeColour != null) {
      cloned.forEach((n) => { n.color = nodeColour; });
    }
    nodes.push(...cloned);
  }
  return nodes;
}
