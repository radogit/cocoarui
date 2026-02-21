/**
 * Settings panel: URL params, update helpers, and panel wiring.
 */

export const SETTINGS_PARAMS = {
  sequence: "sequenceMode",
  background: "bgPreset",
  bgOpacity: "bgOpacity",
  collision: "collision",
  spawn: "spawn",
  autoSvg: "autoSvg",
  autoPng: "autoPng",
  autoCsv: "autoCsv",
  autoJson: "autoJson",
};

export function updateSettingsURLParam(param, value, defaultValue) {
  const url = new URL(window.location);
  const str = value === undefined || value === null ? "" : String(value);
  url.searchParams.set(param, str);
  window.history.replaceState({}, "", url);
}

/**
 * Wire up the settings panel UI. Call after DOM and dependencies are ready.
 * @param {Object} ctx
 * @param {d3.Selection} ctx.container
 * @param {URLSearchParams} ctx.urlParams
 * @param {Object} ctx.sequenceModeRef - { value: string }
 * @param {Function} ctx.setCollisionEnabled
 * @param {Array} ctx.backgroundPresets
 * @param {Function} ctx.applyBackgroundSelection
 * @param {Function} ctx.applyBackgroundOpacity
 */
export function setupSettingsPanel(ctx) {
  const {
    container,
    urlParams,
    sequenceModeRef,
    setCollisionEnabled,
    backgroundPresets,
    applyBackgroundSelection,
    applyBackgroundOpacity,
  } = ctx;

  // Sequence (fixing vs floating)
  const seqFix = document.getElementById("sequence-fixing");
  const seqFloat = document.getElementById("sequence-floating");
  if (seqFix && seqFloat) {
    const seqFromUrl = urlParams.get(SETTINGS_PARAMS.sequence);
    if (seqFromUrl === "floating") {
      sequenceModeRef.value = "floating";
      seqFloat.checked = true;
    } else {
      sequenceModeRef.value = "fixing";
      seqFix.checked = true;
    }
    seqFix.addEventListener("change", () => {
      if (seqFix.checked) {
        sequenceModeRef.value = "fixing";
        updateSettingsURLParam(SETTINGS_PARAMS.sequence, "fixing", "fixing");
      }
    });
    seqFloat.addEventListener("change", () => {
      if (seqFloat.checked) {
        sequenceModeRef.value = "floating";
        updateSettingsURLParam(SETTINGS_PARAMS.sequence, "floating", "fixing");
      }
    });
  }

  // Collision (setCollisionEnabled is passed in from script)
  const collisionCheckbox = document.getElementById("setting-collision");
  if (collisionCheckbox && setCollisionEnabled) {
    const collFromUrl = urlParams.get(SETTINGS_PARAMS.collision);
    if (collFromUrl === "0" || collFromUrl === "false") {
      setCollisionEnabled(false);
      collisionCheckbox.checked = false;
    } else {
      setCollisionEnabled(true);
      collisionCheckbox.checked = true;
    }
    collisionCheckbox.addEventListener("change", () => {
      const enabled = collisionCheckbox.checked;
      setCollisionEnabled(enabled);
      updateSettingsURLParam(SETTINGS_PARAMS.collision, enabled ? "1" : "0", "1");
    });
  }

  // Auto-download checkboxes
  ["autoSvg", "autoPng", "autoCsv", "autoJson"].forEach((key) => {
    const checkbox = document.getElementById("setting-" + key);
    const paramKey = SETTINGS_PARAMS[key];
    if (!checkbox || !paramKey) return;
    checkbox.checked = urlParams.get(paramKey) === "1";
    checkbox.addEventListener("change", () => {
      updateSettingsURLParam(paramKey, checkbox.checked ? "1" : "0", "");
    });
  });

  // Background preset
  const bgSelect = document.getElementById("background-select");
  if (bgSelect && backgroundPresets && applyBackgroundSelection && container) {
    backgroundPresets.forEach(({ id, label }) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = label;
      bgSelect.appendChild(opt);
    });
    const defaultPresetId = backgroundPresets[0]?.id ?? "";
    const bgFromUrl = urlParams.get(SETTINGS_PARAMS.background);
    const validPresetId = backgroundPresets.some((p) => p.id === bgFromUrl) ? bgFromUrl : defaultPresetId;
    bgSelect.value = validPresetId;
    applyBackgroundSelection(validPresetId);
    bgSelect.addEventListener("change", () => {
      applyBackgroundSelection(bgSelect.value);
      updateSettingsURLParam(SETTINGS_PARAMS.background, bgSelect.value, defaultPresetId);
    });
    const bgToggle = document.getElementById("toggleBackground");
    if (bgToggle) {
      bgSelect.disabled = !bgToggle.checked;
      bgToggle.addEventListener("change", () => { bgSelect.disabled = !bgToggle.checked; });
    }
  }

  // Background opacity
  const bgOpacitySlider = document.getElementById("background-opacity");
  const bgOpacityValue = document.getElementById("background-opacity-value");
  if (bgOpacitySlider && bgOpacityValue && applyBackgroundOpacity && container) {
    const bgOpacityFromUrl = urlParams.get(SETTINGS_PARAMS.bgOpacity);
    const validOpacity = bgOpacityFromUrl != null && !isNaN(Number(bgOpacityFromUrl))
      ? Math.max(0, Math.min(100, Number(bgOpacityFromUrl)))
      : 100;
    bgOpacitySlider.value = validOpacity;
    bgOpacityValue.textContent = validOpacity + "%";
    applyBackgroundOpacity(validOpacity);
    updateSettingsURLParam(SETTINGS_PARAMS.bgOpacity, String(validOpacity), "100");
    bgOpacitySlider.addEventListener("input", () => {
      const v = bgOpacitySlider.value;
      bgOpacityValue.textContent = v + "%";
      applyBackgroundOpacity(v);
      updateSettingsURLParam(SETTINGS_PARAMS.bgOpacity, v, "100");
    });
    const bgToggleForOpacity = document.getElementById("toggleBackground");
    if (bgToggleForOpacity) {
      bgOpacitySlider.disabled = !bgToggleForOpacity.checked;
      bgToggleForOpacity.addEventListener("change", () => { bgOpacitySlider.disabled = !bgToggleForOpacity.checked; });
    }
  }
}
