/**
 * One-time scene setup: SVG, axes, defs, patterns, gradients, heatmaps, metrics panel.
 */
import * as Drawing from "./drawing.js";
import * as Heatmaps from "./heatmaps.js";
import * as AppUI from "./ui.js";
import { createMetricsPanel } from "./metrics.js";
import { addDefaultHatchPatterns } from "./patterns.js";

/**
 * Create the full app scene: SVG, container, layers, axes, defs, patterns, gradients, heatmaps, metrics panel.
 * @param {Object} Datasets - Dataset module (nodes, etc.)
 * @param {Array} colours - Colour array for arrowheads and heatmaps
 * @returns {Object} Scene refs: svg, container, nodeLayer, hotspotLayer, linkLayer, windLayer*, width, height, minDim, scaleUnit, tbody, tfoot, defs
 */
export function createScene(Datasets, colours) {
  const { svg, container, nodeLayer, hotspotLayer, linkLayer, windLayerCancel, windLayerStress, windLayerNetForceArrows, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();

  const { tbody, tfoot } = createMetricsPanel();

  const { xScale, yScale } = Drawing.createAxes(container, width, height, minDim);
  Drawing.createGridLines(container, xScale, yScale);

  const defs = svg.append("defs").attr("id", "defs").attr("width", 100).attr("height", 100);
  Drawing.createArrowheads(defs, colours);
  addDefaultHatchPatterns(defs);

  Heatmaps.createHeatmapGradients(defs, Datasets.nodes, colours);
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

  AppUI.setupUI();

  return {
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
  };
}
