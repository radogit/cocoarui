/**
 * Metrics table: DOM creation, update logic, format helpers, row hover handlers.
 */
import * as d3 from "d3";
import { colours, colourNameForArrowhead } from "./colours.js";
import { iconDefs } from "./icons.js";

const metricsHeaders = ["name", "colour", "opacity", "fix", "icon", "x", "y", "⌀", "Σ|F|", "|ΣF|", "cancel", "vx", "vy", ""];

/**
 * Build the metrics panel table DOM. Call once after the metrics-panel element exists.
 * @param {string} [selector="#metrics-panel"] - Selector for the panel container
 * @returns {{ metPanel: d3.Selection, tbody: d3.Selection, tfoot: d3.Selection }}
 */
export function createMetricsPanel(selector = "#metrics-panel") {
  const metPanel = d3.select(selector)
    .append("table")
    .attr("class", "metrics");

  metPanel.append("thead").append("tr").selectAll("th")
    .data(metricsHeaders)
    .enter().append("th")
    .text((d) => d);

  const tbody = metPanel.append("tbody").attr("id", "metrics-body");
  const tfoot = metPanel.append("tfoot");

  return { metPanel, tbody, tfoot };
}

/** If node label starts with "rado-Simple Interactable(Clone)-", format as VR.{participant}.{firstSegment}; else return as-is. */
export function formatNodeLabel(label) {
  if (label == null || typeof label !== "string") return label;
  const prefix = "rado-Simple Interactable(Clone)-";
  if (!label.startsWith(prefix)) return label;
  const rest = label.slice(prefix.length);
  const parts = rest.split("-");
  const firstSegment = parts[0] ?? "";
  const participantMatch = rest.match(/participant(\d+)/i);
  const participantNum = participantMatch ? String(participantMatch[1]).padStart(3, "0") : "???";
  return `VR.${participantNum}.${firstSegment}`;
}

/** Split label into at most 2 lines for node circle; prefer split at space near midpoint. */
export function splitLabelIntoTwoLines(label) {
  if (!label || label.length <= 5) return [label];
  const mid = Math.ceil(label.length / 2);
  const before = label.lastIndexOf(" ", mid);
  const splitAt = before >= Math.ceil(label.length * 0.3) ? before : mid;
  return [label.slice(0, splitAt).trim(), label.slice(splitAt).trim()];
}

export function summarise(nodes) {
  const n = nodes.length || 1;
  const sum = { x: 0, y: 0, radius: 0, sumF: 0, netF: 0, cancel: 0, vx: 0, vy: 0 };
  nodes.forEach((d) => {
    sum.x += d.x;
    sum.y += d.y;
    sum.radius += d.radius ?? 0;
    sum.sumF += d._sumF;
    sum.netF += d._netF;
    sum.cancel += d._cancel;
    sum.vx += d.vx;
    sum.vy += d.vy;
  });
  const avg = Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, v / n]));
  return { sum, avg };
}

/**
 * Create metrics updater and row handlers bound to context.
 * @param {Object} ctx
 * @param {d3.Selection} ctx.tbody
 * @param {d3.Selection} ctx.tfoot
 * @param {number} ctx.scaleUnit
 * @param {d3.Selection} ctx.hotspotLayer
 * @param {number} ctx.hotspotOpacityOthersOnHover
 * @param {Function} ctx.setNodeFixed
 * @param {Object} [ctx.buildOrUpdateNodesRef] - { current: Function } ref, set after createNodeRendering
 * @param {d3.Selection} [ctx.nodeLayer]
 * @param {Array} [ctx.nodes]
 * @param {Function} [ctx.markQRStale] - call when node data changes (affects QR payload)
 * @param {d3.Simulation} [ctx.simulation] - reheat when radius changes so collision uses new size
 */
export function createMetricsUpdater(ctx) {
  const {
    tbody,
    tfoot,
    scaleUnit,
    hotspotLayer,
    hotspotOpacityOthersOnHover = 0.06,
    setNodeFixed,
    buildOrUpdateNodesRef,
    nodeLayer,
    nodes,
    markQRStale,
    simulation,
  } = ctx;

  function refreshNodeVisuals() {
    const fn = buildOrUpdateNodesRef?.current;
    if (fn && nodeLayer && nodes) fn(nodeLayer, nodes);
    markQRStale?.();
  }

  function reheatSimulation() {
    if (simulation) simulation.alpha(0.3).restart();
  }

  function handleEnter() {
    const id = this.dataset.id;
    d3.select(`#node-group-${id} .highlight-circle`)
      .classed("hidden", false)
      .classed("haloSpin", true);
    hotspotLayer.selectAll(".hotspot-group").attr("opacity", hotspotOpacityOthersOnHover);
    d3.select(`#hotspot-group-${id}`).attr("opacity", 1);
  }

  function handleLeave() {
    const id = this.dataset.id;
    d3.select(`#node-group-${id} .highlight-circle`)
      .classed("hidden", true)
      .classed("haloSpin", false);
    hotspotLayer.selectAll(".hotspot-group").attr("opacity", 0.3);
  }

  function updateMetrics(nodes, queue) {
    queue = queue || [];
    const combined = [
      ...nodes.map((d) => ({ key: d.id, isQueued: false, node: d })),
      ...queue.map((d, i) => ({ key: "queue-" + i, isQueued: true, node: d })),
    ];

    const rows = tbody
      .selectAll("tr")
      .data(combined, (d) => d.key)
      .join("tr")
      .attr("data-id", (d) => d.node.id)
      .classed("metrics-row-queued", (d) => d.isQueued)
      .on("mouseenter", handleEnter)
      .on("mouseleave", handleLeave);

    rows.each((d) => {
      if (d.isQueued) return;
      const n = d.node;
      const F = n.forces ?? [];
      const sum = F.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0);
      const netx = F.reduce((s, f) => s + f.fx, 0);
      const nety = F.reduce((s, f) => s + f.fy, 0);
      const net = Math.hypot(netx, nety);
      n._sumF = sum;
      n._netF = net;
      n._cancel = sum - net;
    });

    // Name (editable input)
    rows
      .selectAll("td.name-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "name-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.html(`<span class="queued-badge" title="Awaiting introduction">pending</span>`);
            } else {
              const raw = d.node.displayLabel != null ? d.node.displayLabel : d.node.id;
              const label = formatNodeLabel(raw);
              sel.append("input")
                .attr("type", "text")
                .attr("class", "metrics-name-input")
                .attr("title", "Node name")
                .property("value", label)
                .on("change", function (event, rowD) {
                  const row = Array.isArray(rowD) ? rowD[0] : rowD;
                  row.node.displayLabel = this.value.trim() || null;
                  refreshNodeVisuals();
                });
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.selectAll("input").remove();
              sel.html(`<span class="queued-badge" title="Awaiting introduction">pending</span>`);
            } else {
              sel.selectAll(".queued-badge").remove();
              const raw = d.node.displayLabel != null ? d.node.displayLabel : d.node.id;
              const label = formatNodeLabel(raw);
              let input = sel.select("input");
              if (input.empty()) input = sel.append("input").attr("type", "text").attr("class", "metrics-name-input").attr("title", "Node name").on("change", function (event, rowD) {
                const row = Array.isArray(rowD) ? rowD[0] : rowD;
                row.node.displayLabel = this.value.trim() || null;
                refreshNodeVisuals();
              });
              if (document.activeElement !== input.node()) input.property("value", label);
            }
          })
      );

    // Colour (dropdown)
    rows
      .selectAll("td.colour-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "colour-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
            } else {
              const selSelect = sel.append("select").attr("class", "metrics-colour-select").attr("title", "Node colour").on("change", function (event, rowD) {
                const row = Array.isArray(rowD) ? rowD[0] : rowD;
                row.node.color = this.value;
                refreshNodeVisuals();
              });
              ["white", ...colours].forEach((c) => selSelect.append("option").attr("value", c).text(c));
              const current = colourNameForArrowhead(d.node.color);
              const opts = ["white", ...colours];
              selSelect.property("value", opts.includes(current) ? current : colours[0]);
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
              sel.selectAll("select").remove();
            } else {
              sel.classed("metric-pending", false);
              const select = sel.select("select");
              if (document.activeElement !== select.node()) {
                const current = colourNameForArrowhead(d.node.color);
                const opts = ["white", ...colours];
                select.property("value", opts.includes(current) ? current : colours[0]);
              }
            }
          })
      );

    // Opacity (slider)
    rows
      .selectAll("td.opacity-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "opacity-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
            } else {
              const opacity = d.node.circleOpacity != null ? Math.round(d.node.circleOpacity * 100) : 60;
              sel.append("input")
                .attr("type", "range")
                .attr("class", "metrics-opacity-slider")
                .attr("min", 0)
                .attr("max", 100)
                .attr("title", "Node opacity")
                .property("value", opacity)
                .on("input", function (event, rowD) {
                  const row = Array.isArray(rowD) ? rowD[0] : rowD;
                  row.node.circleOpacity = Number(this.value) / 100;
                  refreshNodeVisuals();
                });
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
              sel.selectAll("input").remove();
            } else {
              sel.classed("metric-pending", false);
              const input = sel.select("input");
              if (document.activeElement !== input.node()) {
                const opacity = d.node.circleOpacity != null ? Math.round(d.node.circleOpacity * 100) : 60;
                input.property("value", opacity);
              }
            }
          })
      );

    // Fix (checkbox)
    rows
      .selectAll("td.fixed-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "fixed-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
            } else {
              sel
                .append("label")
                .attr("class", "fixed-checkbox-label")
                .append("input")
                .attr("type", "checkbox")
                .attr("title", "Fix/unfix node position")
                .property("checked", (d) => (Array.isArray(d) ? d[0] : d).node.isFixed)
                .on("change", function (event, rowD) {
                  event.stopPropagation();
                  const row = Array.isArray(rowD) ? rowD[0] : rowD;
                  setNodeFixed(row.node, this.checked);
                });
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
              sel.selectAll("label").remove();
            } else {
              sel.classed("metric-pending", false);
              sel.select("input").property("checked", (Array.isArray(d) ? d[0] : d).node.isFixed);
            }
          })
      );

    // Representation (icon dropdown)
    rows
      .selectAll("td.representation-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "representation-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
            } else {
              const selSelect = sel.append("select").attr("class", "metrics-representation-select").attr("title", "Node icon").on("change", function (event, rowD) {
                const row = Array.isArray(rowD) ? rowD[0] : rowD;
                row.node.representation = this.value;
                refreshNodeVisuals();
              });
              selSelect.append("option").attr("value", "none").text("—");
              iconDefs.forEach((def) => selSelect.append("option").attr("value", def.key).text(def.key));
              selSelect.property("value", d.node.representation || "number");
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("—").classed("metric-pending", true);
              sel.selectAll("select").remove();
            } else {
              sel.classed("metric-pending", false);
              const select = sel.select("select");
              if (document.activeElement !== select.node()) {
                select.property("value", d.node.representation || "number");
              }
            }
          })
      );

    // Numeric metrics (x, y, ⌀, Σ|F|, |ΣF|, cancel, vx, vy)
    const metricCols = ["x", "y", "d", "sumF", "netF", "cancel", "vx", "vy"];
    rows
      .selectAll("td.metric")
      .data((d) =>
        d.isQueued
          ? metricCols.map((col) => ({ col, val: "—", row: d }))
          : [
              { col: "x", val: (d.node.x / scaleUnit).toFixed(0), row: d },
              { col: "y", val: (-d.node.y / scaleUnit).toFixed(0), row: d },
              { col: "d", val: (2 * (d.node.radius ?? 0) / scaleUnit).toFixed(1), row: d },
              { col: "sumF", val: d.node._sumF.toFixed(0), row: d },
              { col: "netF", val: d.node._netF.toFixed(0), row: d },
              { col: "cancel", val: d.node._cancel.toFixed(0), row: d },
              { col: "vx", val: d.node.vx.toFixed(0), row: d },
              { col: "vy", val: d.node.vy.toFixed(0), row: d },
            ]
      )
      .join(
        (enter) =>
          enter
            .append("td")
            .attr("class", (m) => "metric" + (m.col === "d" ? " diameter-cell" : ""))
            .each(function (m) {
              const sel = d3.select(this);
              if (m.col === "d" && !m.row.isQueued) {
                sel
                  .append("input")
                  .attr("type", "number")
                  .attr("class", "metrics-diameter-input")
                  .attr("title", "Node diameter")
                  .attr("step", "0.1")
                  .attr("min", "0.2")
                  .property("value", m.val)
                  .on("change", function () {
                    const v = parseFloat(this.value);
                    if (Number.isFinite(v) && v > 0) {
                      m.row.node.radius = (v / 2) * scaleUnit;
                      refreshNodeVisuals();
                      reheatSimulation();
                    }
                  });
              } else {
                sel.text(m.val);
              }
            }),
        (update) =>
          update.each(function (m) {
            const sel = d3.select(this);
            if (m.col === "d" && !m.row.isQueued) {
              const input = sel.select("input");
              if (document.activeElement !== input.node()) {
                input.property("value", m.val);
              }
            } else {
              sel.text(m.val);
            }
          })
      );

    // Remove button (last column)
    rows
      .selectAll("td.remove-cell")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "remove-cell").each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.text("");
            } else {
              sel.append("button")
                .attr("class", "remove-btn")
                .attr("title", "Delete " + d.node.id)
                .attr("data-id", d.node.id)
                .text("✕");
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            if (d.isQueued) {
              sel.selectAll("button").remove();
              sel.text("");
            } else {
              sel.select("button").attr("data-id", d.node.id);
            }
          })
      );

    const { sum, avg } = summarise(nodes);
    const footData = [
      ["Σ", null, null, null, null, null, sum.x / scaleUnit, -sum.y / scaleUnit, (2 * sum.radius) / scaleUnit, sum.sumF, sum.netF, sum.cancel, sum.vx, sum.vy, null],
      ["μ", null, null, null, null, null, avg.x / scaleUnit, -avg.y / scaleUnit, (2 * avg.radius) / scaleUnit, avg.sumF, avg.netF, avg.cancel, avg.vx, avg.vy, null],
    ];

    const footRows = tfoot.selectAll("tr").data(footData).join("tr");

    footRows
      .selectAll("td")
      .data((d) => d)
      .join("td")
      .text((d) => (Number.isFinite(d) ? d.toFixed(0) : d ?? ""));
  }

  return { updateMetrics, formatNodeLabel, handleEnter, handleLeave };
}
