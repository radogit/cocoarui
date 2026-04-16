/**
 * Dataset/spawn registry (background-style).
 * - datasetSources: individual sources (each is an array of { name, nodes, ... }).
 * - spawnPresets: groups that reference one or more entries from sources; can combine e.g. "Power" from VR1+VR2+VR3+VR4.
 * Spawn buttons are built from spawnPresets; each preset becomes one button that spawns the combined nodes.
 */

import * as Datasets from "./datasets.js";
import { DatasetsVR1, DatasetsVR2, DatasetsVR3, DatasetsVR4, DatasetsPPD, DatasetsPPA } from "../personal/datasets.js";
import * as DatasetsLayouts from "../personal/datasetsLayouts.js";

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
  Layouts: DatasetsLayouts.preppedLayouts,
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
  Layouts: "spawnButtonContainerLayouts",
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
        entries: [{
          sourceId,
          entryName: entry.name,
          ...(entry.nodeCircleOpacity != null && { nodeCircleOpacity: entry.nodeCircleOpacity }),
          ...(entry.nodeStroke != null && { nodeStroke: entry.nodeStroke }),
          ...(entry.nodeStrokeWidth != null && { nodeStrokeWidth: entry.nodeStrokeWidth }),
        }],
        ...(entry.description != null && { description: entry.description }),
        ...(entry.descriptionTitle != null && { descriptionTitle: entry.descriptionTitle }),
        ...(entry.descriptionText != null && { descriptionText: entry.descriptionText }),
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
 * - nodeCircleOpacity (preset/entry): optional number 0–1 for node circle opacity; cascade entry > preset.
 * - nodeStroke (preset/entry): optional stroke colour for the node circle (e.g. "black", "#333"); cascade entry > preset.
 * - nodeStrokeWidth (preset/entry): optional stroke width in px (e.g. 1, 2); cascade entry > preset.
 * - links: optional array of { fromLabel, toLabel, color? }. color is a colour name (e.g. "red", "blue") from the app palette; arrow stroke and arrowhead use it.
 * - description: optional string; legacy single-field description (shown as body text).
 * - descriptionTitle: optional string; shown bold above descriptionText in the Description panel.
 * - descriptionText: optional string; shown below descriptionTitle. If only description is set, it is used as body text.
 */
const combinedPresets = [
    { id: "power-all", label: "Power (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Power across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "VR1-VR3 cluster strongly in the left visual field, while PPD takes a similar position to the right. PPA and VR4 (both ascent) assume a comparable position. All nodes are positioned in a similar vertical band (-25 to -35). Nodes from PPA and PPD are larger (14-18) than the four nodes from the VR study (9-11). As regard differences between descent and ascent, a weak effect is observed between PPD and PPA, and even less so in VR1-VR3. However, the difference between VR3 and VR4 is notable, illustrating a strong effect of higher immesion within the VR study.",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Power-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Power-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-power",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-power",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-power",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-power",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "distance-all", label: "Distance (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Distance across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "All nodes are placed centrally. Nodes from the low-fidelity study (PPD and PPA) were both placed the lowest (-55 to -60). With respect to difference beween descent and ascent, a stronger effect is observed in the high-fidelity study (VR1 vs VR3), however the eventual nodes of VR2 and VR4 appear to end up similarly positioned. As regard the prototyping condition (standing vs. cycling), a weak effect is observed in positioning, with a difference in size observed between VR1 (18) and VR2 (12).",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Distance-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Distance-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-distance",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-distance",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-distance",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-distance",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "navigation-all", label: "Navigation (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Navigation across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "Observed is a stable central placement across all conditions, both vertically and horizontally. The vertical placement in low-fidelity study sits higher (-15 to -16) than in the high-fidelity study (-30 to -35), but is consistent within each study, suggesting low scenario effect (descent vs ascent; standing vs cycling) and stronger fidelity effect.",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Navigation-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Navigation-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-navigation",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-navigation",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-navigation",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-navigation",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "heartrate-all", label: "Heartrate (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Heartrate across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "While the outcomes of the low-fidelity study placed heartrate on the left in a similar place (x ≈ -40 to -45), all the nodes of high-fidelity study gravitate towards the right (x ≈ 6 to 30), showing a strong fidelity effect. Within the high-fidelity study, VR1 places heartrate close to the horizon, with a progressive downward migration from VR1-VR4, suggesting an effect of the prototyping condition (standing vs. cycling). The diameter shrinks between the low- (13-14) and high-fidelity study (7-9).",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Heartrate-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Heartrate-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-heartrate",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-heartrate",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-heartrate",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-heartrate",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "speed-all", label: "Speed (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Speed across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "Nodes in the low-fidelity study are seen in a near the same position (suggesting no scenario effect), and are strongly right-biased (36-37). The high-fidelity study shows a scenario effect, centralising the nodes in VR1-VR2 (2-5), with the ascent reintroducing the right bias with the VR4 being placed in a much similar position to the low-fidelity counterpart of PPA. There is a strong difference in size between fidelies (15 to 8-9).",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Speed-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Speed-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-speed",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-speed",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-speed",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-speed",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "gradient-all", label: "Gradient (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Gradient across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "Nodes of the low-fidelity study are positioned high vertically (-3 to 16), with the PPD uniquely sitting above the horizon. Nodes of the high-fidelity study move gradient downward (-27 to -46). Fidelity had little effect on the size of nodes (10-13). Short of VR4 (x=-11), all remaining nodes sit left (17-49). The effect of scenario (descent vs ascent) is observed in each pairing, consistently resulting in a left-ward shift.",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Gradient-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD" },
        { sourceId: "PPA", entryName: "Gradient-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA" },
        { sourceId: "VR1", entryName: "type-gradient",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-gradient",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-gradient",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-gradient",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },
    { id: "time-all", label: "Time (PPD+PPA & VR1-VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ddd",
      descriptionTitle: "Comparison of type-metric: Time across six scenarios: low-fidelity descent (blue) and ascent (red) and high-fidelity descent-standing (orange, hatched), descent-cycling (orange), ascent-standing (purple, hatched), and ascent-cycling (purple). ",
      descriptionText: "Positioning of the low-fidelity nodes is identical across scenarios, and off to the right. Conversly, high-fidelity nodes diverge across scenarios, and are strongly leftward.Furthermore, the size of nodes differs strongly between fidelities (12 to 6-7).",
      links: [
        // { fromLabel: "PPD", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "VR1", toLabel: "VR2", color: "cyan" },
        // { fromLabel: "PPA", toLabel: "VR4", color: "magenta" },
        // { fromLabel: "VR3", toLabel: "VR4", color: "magenta" }
      ],
      entries: [
        { sourceId: "PPD", entryName: "Time-PP-descent", nodeColour: "#00f",    nodeLabel: "PPD"},
        { sourceId: "PPA", entryName: "Time-PP-ascent",  nodeColour: "#f00",    nodeLabel: "PPA"},
        { sourceId: "VR1", entryName: "type-time",       nodeColour: "#ff8000", nodeLabel: "VR1" }, //, nodeFill: "url(#diag-hatch-orange)"},
        { sourceId: "VR2", entryName: "type-time",       nodeColour: "#ff8000", nodeLabel: "VR2" },
        { sourceId: "VR3", entryName: "type-time",       nodeColour: "#900090", nodeLabel: "VR3" }, //, nodeFill: "url(#diag-hatch-purple)"},
        { sourceId: "VR4", entryName: "type-time",       nodeColour: "#900090", nodeLabel: "VR4" },
      ] 
    },





    { id: "layout-PPD", label: "Layout (Paper Pano Descent)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#66f", nodeColour: "#00f", 
      descriptionTitle: "Layout based on data of scenario: Descent (PPD), of the low-fidelity study (paper panorama study)",
      descriptionText: "Left side is largely unused, with all but one node (heartrate) being positioned within the center-leftward horizontal band of -4 to 36. All nodes centres are positioned below -15 vertically, with heartrate time and distance in the deep bottom. There is a right-side cluster (speed 2x, power, time).",
      entries: [
        { sourceId: "PPD", entryName: "Speed-PP-descent",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "PPD", entryName: "Distance-PP-descent",   nodeLabel: "2-distance",   nodeCircleOpacity: 0.55 },
        { sourceId: "PPD", entryName: "Navigation-PP-descent", nodeLabel: "3-navigation", nodeCircleOpacity: 0.50 },
        { sourceId: "PPD", entryName: "Speed-PP-descent",      nodeLabel: "4-speed",      nodeCircleOpacity: 0.45 },
        { sourceId: "PPD", entryName: "Time-PP-descent",       nodeLabel: "5-time",       nodeCircleOpacity: 0.40 },
        { sourceId: "PPD", entryName: "Power-PP-descent",      nodeLabel: "6-power",      nodeCircleOpacity: 0.35 },
        { sourceId: "PPD", entryName: "Distance-PP-descent",   nodeLabel: "7-distance",   nodeCircleOpacity: 0.30 },
        { sourceId: "PPD", entryName: "Heartrate-PP-descent",  nodeLabel: "8-heartrate",  nodeCircleOpacity: 0.25 },
      ] 
    },
    { id: "layout-PPA", label: "Layout (Paper Pano Ascent)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff0000", nodeColour: "#f00", 
      descriptionTitle: "Layout based on data of scenario: Ascent (PPA), of the low-fidelity study (paper panorama study)",
      descriptionText: "The left side remains a largely ununsed area, with all but one node (heartrate) placed in two vertical bands: central (1-8, 17) and right (32-37). Nodes approach the space closer to the horizon (navigation, gradient). The right-side cluster (speed 2x, time) laregly retains its position.",
      entries: [
        { sourceId: "PPA", entryName: "Speed-PP-ascent",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "PPA", entryName: "Distance-PP-ascent",   nodeLabel: "2-distance",   nodeCircleOpacity: 0.55 },
        { sourceId: "PPA", entryName: "Navigation-PP-ascent", nodeLabel: "3-navigation", nodeCircleOpacity: 0.50 },
        { sourceId: "PPA", entryName: "Power-PP-ascent",      nodeLabel: "4-power",      nodeCircleOpacity: 0.45 },
        { sourceId: "PPA", entryName: "Time-PP-ascent",       nodeLabel: "5-time",       nodeCircleOpacity: 0.40 },
        { sourceId: "PPA", entryName: "Gradient-PP-ascent",   nodeLabel: "6-gradient",   nodeCircleOpacity: 0.35 },
        { sourceId: "PPA", entryName: "Heartrate-PP-ascent",  nodeLabel: "7-heartrate",  nodeCircleOpacity: 0.30 },
        { sourceId: "PPA", entryName: "Speed-PP-ascent",      nodeLabel: "8-speed",      nodeCircleOpacity: 0.25 },
        { sourceId: "PPA", entryName: "Distance-PP-ascent",   nodeLabel: "9-distance",   nodeCircleOpacity: 0.20 },
        { sourceId: "PPA", entryName: "Navigation-PP-ascent", nodeLabel: "10-navigation", nodeCircleOpacity: 0.15 },
      ] 
    },
    { id: "layout-VR1", label: "Layout (VR1)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", nodeFill: "url(#diag-hatch-orange)",
      descriptionTitle: "Layout based on data of scenario: Descent-standing (VR1), of the high-fidelity study (VR study)",
      descriptionText: "All but one node (heartrate) are positioned below -23 vertically. All but two nodes (heartrate, gradient; both at x=30) are clustered together in a central-leftward horizontal band of -30 to 8. Distance and navigation are the largest nodes (17-18), with the rest sized 9-11.",
      entries: [
        { sourceId: "VR1", entryName: "type-speed",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "VR1", entryName: "type-navigation", nodeLabel: "2-navigation", nodeCircleOpacity: 0.55 },
        { sourceId: "VR1", entryName: "type-distance",   nodeLabel: "3-distance",   nodeCircleOpacity: 0.50 },
        { sourceId: "VR1", entryName: "type-heartrate",  nodeLabel: "4-heartrate",  nodeCircleOpacity: 0.45 },
        { sourceId: "VR1", entryName: "type-power",      nodeLabel: "5-power",      nodeCircleOpacity: 0.40 },
        { sourceId: "VR1", entryName: "type-speed",      nodeLabel: "6-speed",      nodeCircleOpacity: 0.35 },
        { sourceId: "VR1", entryName: "type-gradient",   nodeLabel: "7-gradient",   nodeCircleOpacity: 0.30 },
        { sourceId: "VR1", entryName: "type-navigation", nodeLabel: "8-navigation", nodeCircleOpacity: 0.25 },
      ] 
    },
    { id: "layout-VR2", label: "Layout (VR2)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#ff8000", nodeColour: "#ff8000", 
      descriptionTitle: "Layout based on data of scenario: Descent-cycling (VR2), of the high-fidelity study (VR study)",
      descriptionText: "All nodes are push downward, sitting in the vertical band of -28 to-46. Node sizes have shrunk (6-14). A central-leftward cluster persists (-35 to 8, horizontally), with two nodes to the right (heartrate, gradient).",
      entries: [
        { sourceId: "VR2", entryName: "type-speed",       nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "VR2", entryName: "type-navigation",  nodeLabel: "2-navigation", nodeCircleOpacity: 0.55 },
        { sourceId: "VR2", entryName: "type-distance",    nodeLabel: "3-distance",   nodeCircleOpacity: 0.50 },
        { sourceId: "VR2", entryName: "type-power",       nodeLabel: "4-power",      nodeCircleOpacity: 0.45 },
        { sourceId: "VR2", entryName: "type-heartrate",   nodeLabel: "5-heartrate",  nodeCircleOpacity: 0.40 },
        { sourceId: "VR2", entryName: "type-speed",       nodeLabel: "6-speed",      nodeCircleOpacity: 0.35 },
        { sourceId: "VR2", entryName: "type-gradient",    nodeLabel: "7-gradient",   nodeCircleOpacity: 0.30 },
        { sourceId: "VR2", entryName: "type-navigation",  nodeLabel: "8-navigation", nodeCircleOpacity: 0.25 },
        { sourceId: "VR2", entryName: "type-time",        nodeLabel: "9-time",       nodeCircleOpacity: 0.20 },
      ] 
    },
    { id: "layout-VR3", label: "Layout (VR3)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", nodeFill: "url(#diag-hatch-purple)",
      descriptionTitle: "Layout based on data of scenario: Ascent-standing (VR3), of the high-fidelity study (VR study)",
      descriptionText: "All nodes reside in the vertical band of -28 to -46, short of time sitting above the horizon. Horizontal utilisation is more even, with a central-leftward cluster broken up into two, and a new right-hand cluster (speed 2x, heartrate, gradient). Nodes have shrunk further (6-12).",
      entries: [
        { sourceId: "VR3", entryName: "type-speed",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "VR3", entryName: "type-power",      nodeLabel: "2-power",      nodeCircleOpacity: 0.55 },
        { sourceId: "VR3", entryName: "type-distance",   nodeLabel: "3-distance",   nodeCircleOpacity: 0.50 },
        { sourceId: "VR3", entryName: "type-navigation", nodeLabel: "4-navigation", nodeCircleOpacity: 0.45 },
        { sourceId: "VR3", entryName: "type-heartrate",  nodeLabel: "5-heartrate",  nodeCircleOpacity: 0.40 },
        { sourceId: "VR3", entryName: "type-gradient",   nodeLabel: "6-gradient",   nodeCircleOpacity: 0.35 },
        { sourceId: "VR3", entryName: "type-speed",      nodeLabel: "7-speed",      nodeCircleOpacity: 0.30 },
        { sourceId: "VR3", entryName: "type-power",      nodeLabel: "8-power",      nodeCircleOpacity: 0.25 },
        { sourceId: "VR3", entryName: "type-time",       nodeLabel: "9-time",       nodeCircleOpacity: 0.20 },
      ] 
    },
    { id: "layout-VR4", label: "Layout (VR4)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#900090", nodeColour: "#900090", 
      descriptionTitle: "Layout based on data of scenario: Ascent-cycling (VR4), of the high-fidelity study (VR study)",
      descriptionText: "This is the most compressed layout. All nodes reside in the vertical band of -24 to -45. All but three nodes form a central cluster (-5 to 12). Nodes have shrunk slightly. The time node shifts from above the horizon down to the handlebar.",
      entries: [
        { sourceId: "VR4", entryName: "type-speed",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60 },
        { sourceId: "VR4", entryName: "type-power",      nodeLabel: "2-power",      nodeCircleOpacity: 0.55 },
        { sourceId: "VR4", entryName: "type-distance",   nodeLabel: "3-distance",   nodeCircleOpacity: 0.50 },
        { sourceId: "VR4", entryName: "type-navigation", nodeLabel: "4-navigation", nodeCircleOpacity: 0.45 },
        { sourceId: "VR4", entryName: "type-heartrate",  nodeLabel: "5-heartrate",  nodeCircleOpacity: 0.40 },
        { sourceId: "VR4", entryName: "type-gradient",   nodeLabel: "6-gradient",   nodeCircleOpacity: 0.35 },
        { sourceId: "VR4", entryName: "type-speed",      nodeLabel: "7-speed",      nodeCircleOpacity: 0.30 },
        { sourceId: "VR4", entryName: "type-power",      nodeLabel: "8-power",      nodeCircleOpacity: 0.25 },
        { sourceId: "VR4", entryName: "type-time",       nodeLabel: "9-time",       nodeCircleOpacity: 0.20 },
      ] 
    },
    { id: "layout-descent", label: "Descent (PPD+VR2) (prepped)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#a0a0a0", nodeColour: "#808080", 
      entries: [
        { sourceId: "Layouts", entryName: "PPD-speed",      nodeLabel: "1-speed",      nodeCircleOpacity: 0.60, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 10},
        { sourceId: "Layouts", entryName: "PPD-distance",   nodeLabel: "2-distance",   nodeCircleOpacity: 0.55, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 9},
        { sourceId: "Layouts", entryName: "PPD-navigation", nodeLabel: "3-navigation", nodeCircleOpacity: 0.50, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 8},
        { sourceId: "Layouts", entryName: "PPD-speed2",     nodeLabel: "4-speed2",     nodeCircleOpacity: 0.45, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 7},
        { sourceId: "Layouts", entryName: "PPD-time",       nodeLabel: "5-time",       nodeCircleOpacity: 0.40, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 6},
        { sourceId: "Layouts", entryName: "PPD-power",      nodeLabel: "6-power",      nodeCircleOpacity: 0.35, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 5},
        { sourceId: "Layouts", entryName: "PPD-distance2",  nodeLabel: "7-distance2",  nodeCircleOpacity: 0.30, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 4},
        { sourceId: "Layouts", entryName: "PPD-heartrate",  nodeLabel: "8-heartrate",  nodeCircleOpacity: 0.25, nodeColour: "#0000ff00", nodeStroke: "#0000ff", nodeStrokeWidth: 3},


        { sourceId: "Layouts", entryName: "VR2-speed",       nodeLabel: "1-speed",         nodeCircleOpacity: 0.60, nodeColour: "#ff8000"},
        { sourceId: "Layouts", entryName: "VR2-navigation",  nodeLabel: "2-navigation",    nodeCircleOpacity: 0.55, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-distance",    nodeLabel: "3-distance",      nodeCircleOpacity: 0.50, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-power",       nodeLabel: "4-power",         nodeCircleOpacity: 0.45, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-heartrate",   nodeLabel: "5-heartrate",     nodeCircleOpacity: 0.40, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-speed2",      nodeLabel: "6-speed #2",      nodeCircleOpacity: 0.35, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-gradient",    nodeLabel: "7-gradient",      nodeCircleOpacity: 0.30, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-navigation2", nodeLabel: "8-navigation #2", nodeCircleOpacity: 0.25, nodeColour: "#ff8000" },
        { sourceId: "Layouts", entryName: "VR2-time",        nodeLabel: "9-time",          nodeCircleOpacity: 0.20, nodeColour: "#ff8000" },
      ]
    },
    { id: "layout-ascent", label: "Ascent (PPA+VR4) (prepped)", panelId: "spawnButtonContainerDynamicGroups", uiButtonColour: "#a0a0a0", nodeColour: "#808080", 
      entries: [
        { sourceId: "Layouts", entryName: "PPA-speed",      nodeLabel: "1-speed",          nodeCircleOpacity: 0.60, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 10 },
        { sourceId: "Layouts", entryName: "VR4-speed",      nodeLabel: "1-speed",          nodeCircleOpacity: 0.60, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-distance",   nodeLabel: "2-distance",       nodeCircleOpacity: 0.55, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 9 },
        { sourceId: "Layouts", entryName: "VR4-power",      nodeLabel: "2-power",          nodeCircleOpacity: 0.55, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-navigation", nodeLabel: "3-navigation",     nodeCircleOpacity: 0.50, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 8 },
        { sourceId: "Layouts", entryName: "VR4-distance",   nodeLabel: "3-distance",       nodeCircleOpacity: 0.50, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-power",      nodeLabel: "4-power",          nodeCircleOpacity: 0.45, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 7 },
        { sourceId: "Layouts", entryName: "VR4-navigation", nodeLabel: "4-navigation",     nodeCircleOpacity: 0.45, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-time",       nodeLabel: "5-time",           nodeCircleOpacity: 0.40, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 6 },
        { sourceId: "Layouts", entryName: "VR4-heartrate",  nodeLabel: "5-heartrate",      nodeCircleOpacity: 0.40, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-gradient",   nodeLabel: "6-gradient",       nodeCircleOpacity: 0.35, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 5 },
        { sourceId: "Layouts", entryName: "VR4-gradient",   nodeLabel: "6-gradient",       nodeCircleOpacity: 0.35, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-heartrate",  nodeLabel: "7-heartrate",      nodeCircleOpacity: 0.30, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 4 },
        { sourceId: "Layouts", entryName: "VR4-speed2",     nodeLabel: "7-speed #2",       nodeCircleOpacity: 0.30, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-speed2",     nodeLabel: "8-speed #2",       nodeCircleOpacity: 0.25, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 3 },
        { sourceId: "Layouts", entryName: "VR4-power2",     nodeLabel: "8-power #2",       nodeCircleOpacity: 0.25, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-distance2",  nodeLabel: "9-distance #2",    nodeCircleOpacity: 0.20, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 2 },
        { sourceId: "Layouts", entryName: "VR4-time",       nodeLabel: "9-time",           nodeCircleOpacity: 0.20, nodeColour: "#900090" },
        { sourceId: "Layouts", entryName: "PPA-navigation2",nodeLabel: "10-navigation #2", nodeCircleOpacity: 0.15, nodeColour: "#ff000000", nodeStroke: "#f00", nodeStrokeWidth: 1 },


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
  const presetNodeCircleOpacity = preset.nodeCircleOpacity;
  const presetNodeStroke = preset.nodeStroke;
  const presetNodeStrokeWidth = preset.nodeStrokeWidth;
  const nodes = [];
  for (const entryRef of preset.entries) {
    const {
      sourceId,
      entryName,
      nodeColour: entryNodeColour,
      nodeFill: entryNodeFill,
      nodeLabel: entryNodeLabel,
      nodeCircleOpacity: entryNodeCircleOpacity,
      nodeStroke: entryNodeStroke,
      nodeStrokeWidth: entryNodeStrokeWidth,
    } = entryRef;
    const effectiveColour = entryNodeColour != null ? entryNodeColour : presetNodeColour;
    const effectiveFill = entryNodeFill != null ? entryNodeFill : presetNodeFill;
    const effectiveLabel = entryNodeLabel != null ? entryNodeLabel : presetNodeLabel;
    const effectiveCircleOpacity = entryNodeCircleOpacity != null ? entryNodeCircleOpacity : presetNodeCircleOpacity;
    const effectiveStroke = entryNodeStroke != null ? entryNodeStroke : presetNodeStroke;
    const effectiveStrokeWidth = entryNodeStrokeWidth != null ? entryNodeStrokeWidth : presetNodeStrokeWidth;
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
      if (effectiveCircleOpacity != null) n.circleOpacity = effectiveCircleOpacity;
      if (effectiveStroke != null) n.stroke = effectiveStroke;
      if (effectiveStrokeWidth != null) n.strokeWidth = effectiveStrokeWidth;
      n.entryName = entryName;
      n.sourceId = sourceId;
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
