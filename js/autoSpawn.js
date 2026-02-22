/**
 * Auto-start a spawn preset from URL (e.g. ?spawn=power-all).
 * If spawn param is present, spawns the preset and optionally runs auto-downloads.
 */
export function runAutoSpawnFromUrl(urlParams, ctx) {
  const {
    urlParamKeys,
    spawnPresets,
    getNodesForPreset,
    activeLinks,
    updateDescriptionPanel,
    nodeOps,
    getExportFilenameBase,
    Datasets,
    scaleUnit,
  } = ctx;

  const spawnPresetId = urlParams.get(urlParamKeys.spawn);
  if (!spawnPresetId) return;

  const preset = spawnPresets.find((p) => p.id === spawnPresetId);
  if (!preset) return;

  const nodes = getNodesForPreset(preset);
  if (nodes.length === 0) return;

  if (Array.isArray(preset.links) && preset.links.length) {
    activeLinks.push(...preset.links);
  }
  updateDescriptionPanel(preset.description);

  nodeOps.dripSpawnSmart(nodes, 1000).then(async () => {
    const currentParams = new URLSearchParams(window.location.search);
    const autoSvg = currentParams.get(urlParamKeys.autoSvg) === "1";
    const autoPng = currentParams.get(urlParamKeys.autoPng) === "1";
    const autoCsv = currentParams.get(urlParamKeys.autoCsv) === "1";
    const autoJson = currentParams.get(urlParamKeys.autoJson) === "1";

    const exportPromises = [];
    if (autoSvg && typeof window.exportSquareSVG === "function") {
      exportPromises.push(window.exportSquareSVG(getExportFilenameBase("svg")));
    }
    if (autoPng && typeof window.exportSquarePNG === "function") {
      exportPromises.push(window.exportSquarePNG(getExportFilenameBase("png"), 4));
    }
    if (autoCsv && typeof window.exportMetricsCSV === "function") {
      exportPromises.push(Promise.resolve().then(() => window.exportMetricsCSV(getExportFilenameBase("csv"), Datasets.nodes, scaleUnit)));
    }
    if (autoJson && typeof window.exportLayoutJSON === "function") {
      exportPromises.push(Promise.resolve().then(() => window.exportLayoutJSON(getExportFilenameBase("json"), Datasets.nodes, scaleUnit)));
    }
    await Promise.all(exportPromises);

    try {
      const raw = sessionStorage.getItem("favQueue");
      if (raw) {
        const { urls, index } = JSON.parse(raw);
        const nextIndex = index + 1;
        if (nextIndex < urls.length) {
          sessionStorage.setItem("favQueue", JSON.stringify({ urls, index: nextIndex }));
          window.location.href = urls[nextIndex];
        } else {
          sessionStorage.removeItem("favQueue");
          console.log("✓ Fav queue complete");
        }
      }
    } catch (_) {}
  });
}
