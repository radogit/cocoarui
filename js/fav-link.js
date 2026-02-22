/**
 * Builds fav links with configurable URL params. Links with class "fav-link" get their
 * href set from defaultParams; use data-overrides='{"spawn":"...","collision":"0"}' to override.
 * Exposes buildFavLinkHref(overrides) for programmatic use.
 */
(function() {
  const defaultParams = {
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

    autoSvg: "1",
    autoPng: "1",
    autoCsv: "1",
    autoJson: "0"
  };

  window.buildFavLinkHref = function(overrides) {
    const params = { ...defaultParams, ...overrides };
    return "?" + new URLSearchParams(params).toString();
  };

  /** Params to show in brackets when they differ from default. Value -> human-readable label; null = default, skip. */
  const paramLabels = {
    collision: { "0": "no collision" },
    obs: { "0": "no obs" },
    obsLines: { "1": "obs lines" },
    obsName: { "1": "obs names" },
    obsImpact: { "1": "obs impact" },
    sequenceMode: { "floating": "floating" },
    bg: { "1": "bg" },
    nodeLabel: { "0": "no labels" },
    netForceArrows: { "0": "no net force" },
    axis: { "0": "no axis" }
  };

  function buildFavLinkLabel(overrides) {
    const params = { ...defaultParams, ...overrides };
    const spawn = params.spawn || "?";
    const mods = [];
    for (const [key, labels] of Object.entries(paramLabels)) {
      const val = String(params[key] ?? "");
      if (labels[val]) mods.push(labels[val]);
    }
    return mods.length ? spawn + " [" + mods.join(", ") + "]" : spawn;
  }

  document.querySelectorAll(".fav-link").forEach(function(el) {
    const overrides = el.dataset.overrides ? JSON.parse(el.dataset.overrides) : {};
    el.href = window.buildFavLinkHref(overrides);
    el.textContent = buildFavLinkLabel(overrides);
  });

  const runQueueBtn = document.getElementById("run-queue-btn");
  if (runQueueBtn) {
    runQueueBtn.addEventListener("click", function() {
      const links = Array.from(document.querySelectorAll(".fav-link"));
      const base = window.location.origin + window.location.pathname;
      const urls = links.map(function(link) {
        const href = link.getAttribute("href") || "";
        const [path, query] = href.split("?");
        const params = new URLSearchParams(query || "");
        params.set("autoSvg", "1");
        params.set("autoPng", "1");
        params.set("autoCsv", "1");
        params.set("autoJson", "1");
        return base + "?" + params.toString();
      }).filter(function(u) {
        const params = new URLSearchParams(u.split("?")[1] || "");
        return params.get("spawn");
      });
      if (!urls.length) {
        console.warn("No fav links with spawn param");
        return;
      }
      try {
        sessionStorage.setItem("favQueue", JSON.stringify({ urls: urls, index: 0 }));
        window.location.href = urls[0];
      } catch (e) {
        console.error("Run queue failed:", e);
      }
    });
  }
})();
