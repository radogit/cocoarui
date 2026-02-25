import * as d3 from "d3";

// All background images (single sources). Presets combine these.
export const imagePaths = [
    { name: 'backgroundBottomBase',   label: 'Bottom base',    width: 180, height: 90, x: -90, y: 18,   fileWidth: 1173, fileHeight: 341, opacity: 1, align: 'xMidYMax meet', url: require('./../img/background-bottom-base.png') },
    { name: 'backgroundTopUphill',    label: 'Top uphill',     width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, opacity: 1, align: 'xMidYMin meet', url: require('./../img/background-top-uphill.jpg') },
    { name: 'backgroundTopDownhill',  label: 'Top downhill',   width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, opacity: 1, align: 'xMidYMin meet', url: require('./../img/background-top-downhill.jpg') },
    { name: 'backgroundVRDownhill',   label: 'VR downhill',    width: 360, height: 180, x: -180, y: -90,  fileWidth: 3840, fileHeight: 1920, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_descent1_2to1.jpg') }, 
    { name: 'backgroundVRUphill',     label: 'VR uphill',      width: 360, height: 180, x: -180, y: -90,  fileWidth: 3840, fileHeight: 1920, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_ascent1_2to1.jpg') },   
    // { name: 'backgroundVRDownhill',   label: 'VR downhill',    width: 180, height: 124, x: -90, y: -34,  fileWidth: 1920, fileHeight: 1323, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_descent1_2to1_+2-withnogrid.png') }, 
    // { name: 'backgroundVRUphill',     label: 'VR uphill',      width: 180, height: 124, x: -90, y: -34,  fileWidth: 1920, fileHeight: 1323, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_ascent1_2to1_+2-withnogrid.png') },
];

// User chooses one preset; each preset shows a set of images by name.
export const backgroundPresets = [
    { id: 'base-downhill',  label: 'Base + Downhill',   imageNames: ['backgroundBottomBase', 'backgroundTopDownhill'] },
    { id: 'base-uphill',    label: 'Base + Uphill',     imageNames: ['backgroundBottomBase', 'backgroundTopUphill'] },
    { id: 'vr-downhill',    label: 'VR Downhill',       imageNames: ['backgroundVRDownhill'] },
    { id: 'vr-uphill',     label: 'VR Uphill',         imageNames: ['backgroundVRUphill'] },
];

/**
 * Create background applier functions bound to a container.
 * @param {d3.Selection} container - SVG container with #background-layer
 * @returns {{ applyBackgroundSelection: Function, applyBackgroundOpacity: Function }}
 */
export function createBackgroundAppliers(container) {
  function applyBackgroundSelection(presetId) {
    const preset = presetId ? backgroundPresets.find((p) => p.id === presetId) : null;
    const showNames = preset ? new Set(preset.imageNames) : new Set();
    container.select("#background-layer").selectAll("image").attr("visibility", function () {
      const name = d3.select(this).attr("data-background-name");
      return showNames.has(name) ? "visible" : "hidden";
    });
  }

  function applyBackgroundOpacity(value) {
    const opacity = Math.max(0, Math.min(1, Number(value) / 100));
    container.select("#background-layer").attr("opacity", opacity);
  }

  return { applyBackgroundSelection, applyBackgroundOpacity };
}
