/**
 * Centralized event listener setup.
 * Call setupListeners(ctx) after DOM and app state are ready.
 */
import * as AppUI from "./ui.js";
import { spawnPresets, getNodesForPreset } from "./spawnPresets.js";
import { getVRMarkersString, generateQRCode } from "./bubblesVR.js";

let draggedContainer = null;

function setupDragAndDropForSpawnButtons() {
  const buttonContainers = document.querySelectorAll(".button-container");

  buttonContainers.forEach((container) => {
    const dragIcon = container.querySelector(".drag-icon");
    if (dragIcon) {
      dragIcon.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        draggedContainer = container;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", container.innerHTML);
        container.classList.add("dragging");
      });

      dragIcon.addEventListener("dragend", () => {
        if (draggedContainer) {
          draggedContainer.classList.remove("dragging");
        }
      });

      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.classList.add("highlight");
      });

      container.addEventListener("dragleave", () => {
        container.classList.remove("highlight");
      });

      container.addEventListener("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (draggedContainer && draggedContainer !== container) {
          const bounding = container.getBoundingClientRect();
          const offset = bounding.y + bounding.height / 2;
          if (e.clientY - offset > 0) {
            container.after(draggedContainer);
          } else {
            container.before(draggedContainer);
          }
        }
        container.classList.remove("highlight");
      });
    }
  });
}

/**
 * Wire up all UI event listeners.
 * @param {Object} ctx
 * @param {Object} ctx.nodeOps - { addOneSmart, removeAllNodes, removeNodeById, dripSpawnSmart }
 * @param {Function} ctx.clearSpawnQueue
 * @param {Function} ctx.updateSettingsURLParam
 * @param {Object} ctx.urlParamKeys
 * @param {Function} ctx.getExportFilenameBase
 * @param {Object} ctx.Datasets - { nodes }
 * @param {number} ctx.scaleUnit
 * @param {Function} ctx.updateDescriptionPanel
 * @param {d3.Selection} ctx.container
 * @param {d3.Selection} ctx.svg
 * @param {number} ctx.minDim
 * @param {d3.Selection} ctx.tbody
 * @param {Function} ctx.onResize
 */
export function setupListeners(ctx) {
  const {
    nodeOps,
    clearSpawnQueue,
    updateSettingsURLParam,
    urlParamKeys,
    getExportFilenameBase,
    Datasets,
    scaleUnit,
    updateDescriptionPanel,
    container,
    svg,
    minDim,
    tbody,
    onResize,
  } = ctx;

  // --- Remove All ---
  const removeAllBtn = document.getElementById("removeAllButton");
  if (removeAllBtn) {
    removeAllBtn.addEventListener("click", () => {
      clearSpawnQueue();
      nodeOps.removeAllNodes();
      updateSettingsURLParam(urlParamKeys.spawn, "", "");
    });
  }

  // --- Add One Smart ---
  const addOneBtn = document.getElementById("addOneSmartButton");
  if (addOneBtn) {
    addOneBtn.addEventListener("click", () => nodeOps.addOneSmart());
  }

  // --- Export buttons ---
  const exportSvg = document.getElementById("downloadSVGButton");
  if (exportSvg) {
    exportSvg.addEventListener("click", () => {
      if (typeof window.exportSquareSVG === "function") {
        window.exportSquareSVG(getExportFilenameBase("svg"));
      }
    });
  }
  const exportPng = document.getElementById("downloadPNGButton");
  if (exportPng) {
    exportPng.addEventListener("click", () => {
      if (typeof window.exportSquarePNG === "function") {
        window.exportSquarePNG(getExportFilenameBase("png"), 4);
      }
    });
  }
  const exportCsv = document.getElementById("downloadCSVButton");
  if (exportCsv) {
    exportCsv.addEventListener("click", () => {
      if (typeof window.exportMetricsCSV === "function") {
        window.exportMetricsCSV(getExportFilenameBase("csv"), Datasets.nodes, scaleUnit);
      }
    });
  }
  const exportJson = document.getElementById("downloadJSONButton");
  if (exportJson) {
    exportJson.addEventListener("click", () => {
      if (typeof window.exportLayoutJSON === "function") {
        window.exportLayoutJSON(getExportFilenameBase("json"), Datasets.nodes, scaleUnit);
      }
    });
  }
  const generateVRBtn = document.getElementById("generateVRButton");
  if (generateVRBtn) {
    generateVRBtn.addEventListener("click", async () => {
      const markersStr = getVRMarkersString(Datasets.nodes, scaleUnit);
      const container = document.getElementById("bubbles-vr-qr-container");
      const autoQR = document.getElementById("setting-autoQR")?.checked ?? false;
      await generateQRCode(markersStr, container, {
        getExportFilenameBase,
        autoDownload: autoQR,
      });
      // Show BubblesVR panel and ensure it's visible
      AppUI.showBubblesVRPanel.boolState = true;
      const toggleCheckbox = document.getElementById(AppUI.showBubblesVRPanel.ToggleObjectString);
      if (toggleCheckbox) toggleCheckbox.checked = true;
      AppUI.showOrHideElement(
        true,
        "." + AppUI.showBubblesVRPanel.DOMObjectString,
        AppUI.showBubblesVRPanel.shorthandString,
        AppUI.showBubblesVRPanel.URLParamString,
        AppUI.showBubblesVRPanel.defaultState
      );
    });
  }

  // --- View panel ---
  const viewPanelCaret = document.getElementById("view-panel-caret");
  const viewPanelCheckbox = document.getElementById("toggleViewPanel");
  if (viewPanelCaret && viewPanelCheckbox) {
    function updateViewPanelCaret() {
      viewPanelCaret.textContent = AppUI.showViewPanel.boolState ? "\u25BC" : "\u25B2";
    }
    updateViewPanelCaret();
    viewPanelCaret.addEventListener("click", () => {
      AppUI.showViewPanel.boolState = !AppUI.showViewPanel.boolState;
      AppUI.showOrHideElement(
        AppUI.showViewPanel.boolState,
        "." + AppUI.showViewPanel.DOMObjectString,
        AppUI.showViewPanel.shorthandString,
        AppUI.showViewPanel.URLParamString,
        AppUI.showViewPanel.defaultState
      );
      viewPanelCheckbox.checked = AppUI.showViewPanel.boolState;
      updateViewPanelCaret();
    });
    viewPanelCheckbox.addEventListener("change", updateViewPanelCaret);
  }

  // --- Spawn buttons from presets ---
  const containersByPanelId = {};
  spawnPresets.forEach((preset) => {
    const panelId = preset.panelId;
    if (!panelId) return;
    if (!containersByPanelId[panelId]) {
      const el = document.getElementById(panelId);
      if (el) containersByPanelId[panelId] = el;
    }
  });

  spawnPresets.forEach((preset) => {
    const target = containersByPanelId[preset.panelId];
    if (!target) return;

    const wrapper = document.createElement("div");
    wrapper.className = "button-container";

    const btn = document.createElement("button");
    btn.textContent = preset.label;
    btn.id = `spawnButton-${preset.id}`;
    const baseColour = preset.uiButtonColour || "#ddd";
    if (preset.nodeFill && String(preset.nodeFill).includes("hatch")) {
      btn.classList.add("spawn-btn-hatch");
      btn.style.setProperty("--spawn-btn-hatch-color", baseColour);
      btn.style.backgroundColor = baseColour;
    } else {
      btn.style.backgroundColor = baseColour;
    }

    btn.addEventListener("click", () => {
      const nodes = getNodesForPreset(preset);
      if (!nodes.length) return;
      if (Array.isArray(preset.links) && preset.links.length) {
        ctx.activeLinks.push(...preset.links);
      }
      updateDescriptionPanel(preset.description);
      updateSettingsURLParam(urlParamKeys.spawn, preset.id, "");
      nodeOps.dripSpawnSmart(nodes, 1000);
    });

    const handle = document.createElement("span");
    handle.className = "drag-icon";
    handle.draggable = true;
    handle.textContent = "☰";
    wrapper.append(btn, handle);
    target.append(wrapper);
  });

  setupDragAndDropForSpawnButtons();

  // --- Collapse headers ---
  document.querySelectorAll(".collapse-header").forEach((header) => {
    header.addEventListener("click", function () {
      const containerEl = this.parentElement;
      const buttons = containerEl.querySelectorAll(".button-container");
      const caret = this.querySelector(".caret");

      buttons.forEach((button) => {
        button.classList.toggle("active");
      });

      const isAnyActive = Array.from(buttons).some((button) => button.classList.contains("active"));
      containerEl.style.height = isAnyActive ? `${buttons.length * 20 + 20}px` : "20px";

      if (caret) caret.classList.toggle("active");
    });
  });

  // --- Metrics table: column highlight on hover ---
  const table = document.querySelector(".metrics");
  if (table) {
    table.addEventListener("mouseover", (event) => {
      const cell = event.target;
      if (cell.tagName === "TD" || cell.tagName === "TH") {
        const index = cell.cellIndex;
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td, th");
          if (cells[index]) {
            cells[index].style.backgroundColor = "#ffffaa";
          }
        });
      }
    });

    table.addEventListener("mouseout", (event) => {
      const cell = event.target;
      if (cell.tagName === "TD" || cell.tagName === "TH") {
        const index = cell.cellIndex;
        const rows = table.querySelectorAll("tr");
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td, th");
          if (cells[index]) {
            cells[index].style.backgroundColor = "";
          }
        });
      }
    });
  }

  // --- Metrics table: remove button click ---
  if (tbody) {
    tbody.on("click", function (e) {
      if (e.target.classList.contains("remove-btn")) {
        nodeOps.removeNodeById(e.target.dataset.id);
      }
    });
  }

  // --- Window resize ---
  window.addEventListener("resize", onResize);

  // --- Keyboard shortcuts ---
  window.addEventListener("keydown", function (event) {
    const inputs = document.querySelectorAll("input[keyboardShortcut]");
    for (const input of inputs) {
      if (event.code === input.getAttribute("keyboardShortcut")) {
        input.checked = !input.checked;
        input.dispatchEvent(new Event("change"));
        event.preventDefault();
        return;
      }
    }
    const buttons = document.querySelectorAll("#debug-panel button[keyboardShortcut], #debug-panel button[keyboardKey]");
    for (const button of buttons) {
      const keyAttr = button.getAttribute("keyboardKey");
      const codeAttr = button.getAttribute("keyboardShortcut");
      if (keyAttr && event.key === keyAttr) {
        button.click();
        event.preventDefault();
        return;
      }
      if (codeAttr && event.code === codeAttr) {
        button.click();
        event.preventDefault();
        return;
      }
    }
  });
}
