/**
 * Builds fav links with configurable URL params. Links with class "fav-link" get their
 * href set from DEFAULT_PARAMS; use data-overrides='{"spawn":"...","collision":"0"}' to override.
 * Exposes buildFavLinkHref(overrides) for programmatic use.
 */
(function() {
  const DEFAULT_PARAMS = {
    spawn: "layout-PPD",
    collision: "1",
    sequenceMode: "fixing",
    nodeLabel: "1",
    obs: "1",
    obsLines: "0",
    obsName: "0",
    obsImpact: "0",
    coords: "0",
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
    nodeCircles: "1",
    nodeIcon: "0",
    nodeLinks: "1",
    axis: "1",
    gridV: "0",
    gridH: "0",
    simulationPanel: "1",
    viewPanel: "1",
    settingsPanel: "1",
    metricsPanel: "1",
    exportPanel: "1",
    favouritesPanel: "0",
    cmd: "0",
    autoSvg: "1",
    autoPng: "1",
    autoCsv: "1"
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
