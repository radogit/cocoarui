/**
 * Metrics table: update logic, format helpers, row hover handlers.
 */
import * as d3 from "d3";

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
 */
export function createMetricsUpdater(ctx) {
  const {
    tbody,
    tfoot,
    scaleUnit,
    hotspotLayer,
    hotspotOpacityOthersOnHover = 0.06,
    setNodeFixed,
  } = ctx;

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

    rows
      .selectAll("td.rowLabel")
      .data((d) => [d])
      .join(
        (enter) =>
          enter.append("td").attr("class", "rowLabel").each(function (d) {
            const sel = d3.select(this);
            const raw = d.node.displayLabel != null ? d.node.displayLabel : d.node.id;
            const label = formatNodeLabel(raw);
            if (d.isQueued) {
              sel.html(
                `<span class="name">${label}</span><span class="queued-badge" title="Awaiting introduction">pending</span>`
              );
            } else {
              sel.html(`
              <span class="name">${label}</span>
              <button class="remove-btn" title="Delete ${d.node.id}" data-id="${d.node.id}">✕</button>`);
            }
          }),
        (update) =>
          update.each(function (d) {
            const sel = d3.select(this);
            const raw = d.node.displayLabel != null ? d.node.displayLabel : d.node.id;
            const label = formatNodeLabel(raw);
            if (d.isQueued) {
              sel.html(
                `<span class="name">${label}</span><span class="queued-badge" title="Awaiting introduction">pending</span>`
              );
            } else {
              sel.html(`
              <span class="name">${label}</span>
              <button class="remove-btn" title="Delete ${d.node.id}" data-id="${d.node.id}">✕</button>`);
            }
          })
      );

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

    rows
      .selectAll("td.metric")
      .data((d) =>
        d.isQueued
          ? ["—", "—", "—", "—", "—", "—", "—", "—"]
          : [
              (d.node.x / scaleUnit).toFixed(0),
              (-d.node.y / scaleUnit).toFixed(0),
              (2 * (d.node.radius ?? 0) / scaleUnit).toFixed(0),
              d.node._sumF.toFixed(0),
              d.node._netF.toFixed(0),
              d.node._cancel.toFixed(0),
              d.node.vx.toFixed(0),
              d.node.vy.toFixed(0),
            ]
      )
      .join(
        (enter) => enter.append("td").attr("class", "metric").text((t) => t),
        (update) => update.text((t) => t)
      );

    const { sum, avg } = summarise(nodes);
    const footData = [
      ["Σ", null, null, null, (2 * sum.radius) / scaleUnit, sum.sumF, sum.netF, sum.cancel, sum.vx, sum.vy],
      ["μ", null, null, null, (2 * avg.radius) / scaleUnit, avg.sumF, avg.netF, avg.cancel, avg.vx, avg.vy],
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
