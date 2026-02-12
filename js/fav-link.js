/**
 * Builds fav links with configurable URL params. Links with class "fav-link" get their
 * href set from DEFAULT_PARAMS; use data-overrides='{"spawn":"...","collision":"0"}' to override.
 * Exposes buildFavLinkHref(overrides) for programmatic use.
 */
(function() {
  const DEFAULT_PARAMS = {
    spawn: "",
    collision: "1",
    sequenceMode: "fixing",
    
    nodeLabel: "1",
    coords: "0",
    nodeCircles: "1",
    nodeIcon: "0",
    nodeLinks: "1",

    obs: "1",
    obsLines: "0",
    obsName: "0",
    obsImpact: "0",


    forceArrows: "0",
    forceArrowsLabels: "0",
    netForceArrows: "1",

    bg: "0",
    bgPreset: "base-downhill",

    stressHeatmap: "0",
    stressHeatmapLabel: "1",
    windCancel: "0",
    windCancelLabel: "0",
    windNetForce: "0",

    axis: "1",
    gridV: "0",
    gridH: "0",

    simulationPanel: "0",
    viewPanel: "0",
    settingsPanel: "1",
    metricsPanel: "0",
    exportPanel: "0",
    favouritesPanel: "1",
    cmd: "0",

    autoSvg: "0",
    autoPng: "0",
    autoCsv: "0"
  };

  window.buildFavLinkHref = function(overrides) {
    const params = { ...DEFAULT_PARAMS, ...overrides };
    return "?" + new URLSearchParams(params).toString();
  };

  document.querySelectorAll(".fav-link").forEach(function(el) {
    const overrides = el.dataset.overrides ? JSON.parse(el.dataset.overrides) : {};
    el.href = window.buildFavLinkHref(overrides);
  });
})();
