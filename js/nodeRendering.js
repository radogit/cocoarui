/**
 * Node DOM creation and per-tick drawing (buildOrUpdateNodes, ticked).
 */
import * as d3 from "d3";
import * as AppUI from "./ui.js";
import * as Icons from "./icons.js";
import * as NodeInteraction from "./nodeInteraction.js";
import { formatNodeLabel, splitLabelIntoTwoLines } from "./metrics.js";
import { colourNameForArrowhead, getArrowheadId } from "./colours.js";
import { getCurrentSpawnQueue } from "./nodeSpawn.js";
import { markQRStale } from "./bubblesVR.js";

/**
 * Create node rendering functions (buildOrUpdateNodes, ticked).
 * @param {Object} ctx
 * @param {d3.Selection} ctx.tbody
 * @param {d3.Selection} ctx.hotspotLayer
 * @param {number} ctx.hotspotOpacityOthersOnHover
 * @param {d3.Selection} ctx.linkLayer
 * @param {number} ctx.scaleUnit
 * @param {d3.Simulation} ctx.simulation
 * @param {Function} ctx.toggleFixed
 * @param {Array} ctx.activeLinks
 * @param {Object} ctx.Datasets
 * @param {Function} ctx.metricsUpdater
 */
export function createNodeRendering(ctx) {
  const {
    tbody,
    hotspotLayer,
    hotspotOpacityOthersOnHover,
    linkLayer,
    scaleUnit,
    simulation,
    toggleFixed,
    activeLinks,
    Datasets,
    metricsUpdater,
  } = ctx;

  let nodeGroup;

  function buildOrUpdateNodes(container, nodes) {
    nodeGroup = container.selectAll(".node-group")
      .data(nodes, d => d.id)
      .join(
        enter => {
          const g = enter.append("g")
            .attr("class", "node-group")
            .attr("id", d => "node-group-" + d.id)
            .on("dblclick", toggleFixed)
            .on("mouseenter", function (event, d) {
              tbody.select(`tr[data-id="${d.id}"]`).classed("row-highlight-from-canvas", true);
              hotspotLayer.selectAll(".hotspot-group").attr("opacity", hotspotOpacityOthersOnHover);
              d3.select(`#hotspot-group-${d.id}`).attr("opacity", 1);
            })
            .on("mouseleave", function (event, d) {
              tbody.select(`tr[data-id="${d.id}"]`).classed("row-highlight-from-canvas", false);
              hotspotLayer.selectAll(".hotspot-group").attr("opacity", 0.3);
            })
            .call(d3.drag()
              .on("start", (e, d) => NodeInteraction.dragStart(e, d, simulation))
              .on("drag", (e, d) => NodeInteraction.dragging(e, d, simulation))
              .on("end", (e, d) => {
                NodeInteraction.dragEnd(e, d, simulation);
                markQRStale();
              })
            );

          g.append("circle")
            .attr("class", "highlight-circle hidden")
            .attr("fill", "none")
            .attr("opacity", 0.8)
            .attr("r", d => (d.radius + 10));

          g.append("circle")
            .attr("class", AppUI.showCircles.boolState ? AppUI.showCircles.DOMObjectString : AppUI.showCircles.DOMObjectString + " hidden")
            .classed("node-fixed", d => d.isFixed)
            .attr("fill", d => d.fill != null ? d.fill : d.color)
            .attr("id", d => "circle-" + d.id)
            .attr("opacity", d => d.circleOpacity != null ? d.circleOpacity : 0.6)
            .attr("r", d => d.radius)
            .style("stroke", d => d.stroke != null ? d.stroke : null)
            .style("stroke-width", d => d.strokeWidth != null ? d.strokeWidth : null)
            .on("mouseover", function (event, d) {
              let targetElement = document.getElementById("spawn-cand-stress-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-cancel-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-netForceArrow-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("node-relations-" + d.id);
              if (targetElement) { targetElement.classList.add("node-relation-hover"); }
            })
            .on("mouseout", function (event, d) {
              let targetElement = document.getElementById("spawn-cand-stress-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("spawn-cand-cancel-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("spawn-cand-netForceArrow-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("node-relations-" + d.id);
              if (targetElement) { targetElement.classList.remove("node-relation-hover"); }
            });

          g.append("rect")
            .attr("class", d => d.representation ? "icon icon-bg node-icon icon-" + d.representation : "icon icon-bg node-icon")
            .attr("fill", "none")
            .attr("opacity", 0.8)
            .attr("rx", 4)
            .attr("x", d => -d.radius / Math.SQRT2)
            .attr("y", d => -d.radius / Math.SQRT2)
            .attr("width", d => d.radius / Math.SQRT2 * 2)
            .attr("height", d => d.radius / Math.SQRT2 * 2);

          g.append("svg:image")
            .attr("href", d => d.representation !== 'none' ? (Icons.iconByKey[d.representation] ?? Icons.iconByKey["number"]) : '')
            .attr("x", d => -d.radius / Math.SQRT2)
            .attr("y", d => -d.radius / Math.SQRT2)
            .attr("width", d => d.radius / Math.SQRT2 * 2)
            .attr("height", d => d.radius / Math.SQRT2 * 2)
            .attr("class", AppUI.showNodeIcon.boolState ? AppUI.showNodeIcon.DOMObjectString : AppUI.showNodeIcon.DOMObjectString + " hidden")
            .attr("fill", "white")
            .style("pointer-events", "none");

          g.each(function (d) {
            const raw = d.displayLabel != null ? String(d.displayLabel) : (typeof d.id === "string" ? d.id : String(d.id));
            const label = formatNodeLabel(raw);
            const maxWidth = 2 * d.radius * 0.75;
            const split = splitLabelIntoTwoLines(label);
            const lines = split.length > 1 ? split : [label];
            const charsPerLine = Math.max(1, Math.ceil(label.length / lines.length));
            const fontSize = Math.min(18, Math.max(4, maxWidth / (charsPerLine * 0.55)));
            const textEl = d3.select(this).append("text")
              .attr("class", AppUI.showNodeLabel.boolState ? AppUI.showNodeLabel.DOMObjectString : AppUI.showNodeLabel.DOMObjectString + " hidden")
              .attr("id", AppUI.showNodeLabel.DOMObjectString + "-" + d.id)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("font-size", fontSize + "px");
            if (lines.length === 1) {
              textEl.append("tspan").attr("x", 0).attr("dy", 0).text(lines[0]);
            } else {
              textEl.append("tspan").attr("x", 0).attr("dy", "-0.5em").text(lines[0]);
              textEl.append("tspan").attr("x", 0).attr("dy", "1em").text(lines[1]);
            }
          });

          g.append("text")
            .attr("class", "coord-label")
            .attr("id", d => "coord-label-" + d.id)
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle");

          g.append("g")
            .attr("class", "force-arrows")
            .attr("id", d => "force-arrows-" + d.id);

          g.append("g")
            .attr("class", "node-relations")
            .attr("id", d => "node-relations-" + d.id);

          return g;
        },
        update => {
          update.select("." + AppUI.showCircles.DOMObjectString)
            .attr("r", d => d.radius)
            .attr("fill", d => d.fill != null ? d.fill : d.color)
            .attr("opacity", d => d.circleOpacity != null ? d.circleOpacity : 0.6)
            .classed("node-fixed", d => d.isFixed);
          update.select(".highlight-circle").attr("r", d => d.radius + 10);
          update.select("rect.icon-bg")
            .attr("class", d => d.representation ? "icon icon-bg node-icon icon-" + d.representation : "icon icon-bg node-icon")
            .attr("x", d => -d.radius / Math.SQRT2)
            .attr("y", d => -d.radius / Math.SQRT2)
            .attr("width", d => (d.radius / Math.SQRT2) * 2)
            .attr("height", d => (d.radius / Math.SQRT2) * 2);
          update.select("image.node-icon")
            .attr("href", d => d.representation !== "none" ? (Icons.iconByKey[d.representation] ?? Icons.iconByKey["number"]) : "")
            .attr("x", d => -d.radius / Math.SQRT2)
            .attr("y", d => -d.radius / Math.SQRT2)
            .attr("width", d => (d.radius / Math.SQRT2) * 2)
            .attr("height", d => (d.radius / Math.SQRT2) * 2);
          update.each(function (d) {
            const raw = d.displayLabel != null ? String(d.displayLabel) : (typeof d.id === "string" ? d.id : String(d.id));
            const label = formatNodeLabel(raw);
            const split = splitLabelIntoTwoLines(label);
            const lines = split.length > 1 ? split : [label];
            const charsPerLine = Math.max(1, Math.ceil(label.length / lines.length));
            const maxWidth = 2 * d.radius * 0.75;
            const fontSize = Math.min(18, Math.max(4, maxWidth / (charsPerLine * 0.55)));
            const textEl = d3.select(this).select("text." + AppUI.showNodeLabel.DOMObjectString);
            if (!textEl.empty()) {
              const dy = lines.length === 1 ? (_, i) => "0" : (_, i) => (i === 0 ? "-0.5em" : "1em");
              textEl.style("font-size", fontSize + "px").selectAll("tspan").data(lines).join("tspan").attr("x", 0).attr("dy", dy).text((l) => l);
            }
          });
          return update;
        },
        exit => exit.remove()
      );

    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    return nodeGroup;
  }

  function ticked() {
    if (!nodeGroup) return;
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);

    if (AppUI.showCoordinates.boolState) {
      nodeGroup.select("." + AppUI.showCoordinates.DOMObjectString)
        .text(d => `(${Math.round(d.x / scaleUnit)}, ${Math.round(-d.y / scaleUnit)})`);
    }

    nodeGroup.selectAll("." + AppUI.showForceArrows.DOMObjectSingleString + ", ." + AppUI.showForceArrows.DOMObjectSingleString + "-value, ." + AppUI.showForceArrows.DOMObjectSingleString + "-label-group").remove();
    nodeGroup.selectAll("." + AppUI.showNodeLines.DOMObjectSingleString + ", ." + AppUI.showNodeLines.DOMObjectSingleString + "-value, ." + AppUI.showNodeLines.DOMObjectSingleString + "-label-group").remove();

    nodeGroup.select("." + AppUI.showCircles.DOMObjectString)
      .attr("r", d => d.radius)
      .classed("node-fixed", d => d.isFixed)
      .style("stroke", d => d.stroke != null ? d.stroke : null)
      .style("stroke-width", d => d.strokeWidth != null ? d.strokeWidth : null);
    nodeGroup.select(".highlight-circle")
      .attr("r", d => d.radius + 10);

    nodeGroup.each(function (d) {
      const arrowGroup = d3.select(this).select("." + AppUI.showForceArrows.DOMObjectString);
      const nodeRelationsGroup = d3.select(this).select("." + AppUI.showNodeLines.DOMObjectString);

      d.hotspots.forEach((hotspot, index) => {
        nodeRelationsGroup.append("line")
          .attr("class", AppUI.showNodeLines.boolState ? AppUI.showNodeLines.DOMObjectSingleString : AppUI.showNodeLines.DOMObjectSingleString + " hidden")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", (-d.x + hotspot.x))
          .attr("y2", (-d.y + hotspot.y))
          .attr("stroke", d.color)
          .attr("stroke-width", 4)
          .attr("stroke-dasharray", "0,20")
          .attr("stroke-linecap", "round")
          .style("opacity", 0.2);
      });

      d.forces.forEach((force, index) => {
        const length = Math.min(Math.sqrt(force.fx ** 2 + force.fy ** 2) * 2, 1000);
        const angle = Math.atan2(force.fy, force.fx);
        const labelAngle = (((angle + Math.PI / 2) / Math.PI) * 180) % 180;
        const labelPosX = (1.0 * length + 35) * Math.cos(angle) + index * 2 - d.forces.length / 2;
        const labelPosY = (1.0 * length + 35) * Math.sin(angle) + index * 2 - d.forces.length / 2;

        arrowGroup.append("line")
          .attr("class", force.source.includes("collision") ?
            (AppUI.showForceArrows.boolState ? AppUI.showForceArrows.DOMObjectSingleString + " " + AppUI.showForceArrows.DOMObjectSingleString + "-orange" : AppUI.showForceArrows.DOMObjectSingleString + " " + AppUI.showForceArrows.DOMObjectSingleString + "-orange hidden") :
            (AppUI.showForceArrows.boolState ? AppUI.showForceArrows.DOMObjectSingleString + " " + AppUI.showForceArrows.DOMObjectSingleString + "-white" : AppUI.showForceArrows.DOMObjectSingleString + " " + AppUI.showForceArrows.DOMObjectSingleString + "-white hidden"))
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", length * Math.cos(angle))
          .attr("y2", length * Math.sin(angle))
          .attr("stroke", force.source.includes("collision") ? "orange" : "white")
          .attr("stroke-width", 5)
          .attr("marker-end", "url(#arrowhead-" + (force.source.includes("collision") ? "orange" : "white") + ")")
          .style("opacity", 0.5);

        const labelGroup = arrowGroup.append("g")
          .attr("class", (AppUI.showForceArrows.boolState && AppUI.showForceArrowsLabels.boolState) ? AppUI.showForceArrows.DOMObjectSingleString + "-label-group" : AppUI.showForceArrows.DOMObjectSingleString + "-label-group hidden")
          .attr("transform", `translate(${labelPosX},${labelPosY})`)
          .attr("opacity", 0.3);
        const bgRect = labelGroup.append("rect")
          .attr("class", AppUI.showForceArrows.DOMObjectSingleString + "-label-bg")
          .attr("x", -20)
          .attr("y", -10)
          .attr("width", 40)
          .attr("height", 20)
          .attr("rx", 4)
          .attr("fill", "rgba(0,0,0)")
          .attr("transform", `rotate(${labelAngle > 90 ? labelAngle - 180 : labelAngle})`);
        const labelText = labelGroup.append("text")
          .attr("class", AppUI.showForceArrows.DOMObjectSingleString + "-label-text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "white")
          .attr("font-size", 12)
          .text(length.toFixed(0) + ' ∠' + labelAngle.toFixed(0) + '°')
          .attr("transform", `rotate(${labelAngle > 90 ? labelAngle - 180 : labelAngle})`);
        const bbox = labelText.node().getBBox();

        bgRect
          .attr("x", bbox.x - 4)
          .attr("y", bbox.y - 2)
          .attr("width", bbox.width + 8)
          .attr("height", bbox.height + 4);
      });

      if (AppUI.showForceArrows.boolState) {
        const netForceX = d.vx;
        const netForceY = d.vy;
        const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

        if (netForceMagnitude > 0.1) {
          const netLength = Math.min(netForceMagnitude * 5, 1000);
          const netAngle = Math.atan2(netForceY, netForceX);

          arrowGroup.append("line")
            .attr("class", (AppUI.showForceArrows.boolState) ? AppUI.showForceArrows.DOMObjectSingleString + " net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString + " net-force-arrow hidden")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", netLength * Math.cos(netAngle))
            .attr("y2", netLength * Math.sin(netAngle))
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead-red)")
            .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);
        }
      }
    });

    if (linkLayer && AppUI.showNodeLinks.boolState) {
      if (activeLinks.length) {
        const nodes = Datasets.nodes;
        const labelToNode = new Map();
        nodes.forEach((n) => {
          const idKey = String(n.id);
          if (!labelToNode.has(idKey)) {
            labelToNode.set(idKey, n);
          }
          if (n.displayLabel != null) {
            const lblKey = String(n.displayLabel);
            if (!labelToNode.has(lblKey)) {
              labelToNode.set(lblKey, n);
            }
          }
        });
        const linkData = activeLinks.map((link) => {
          const source = labelToNode.get(String(link.fromLabel));
          const target = labelToNode.get(String(link.toLabel));
          if (!source || !target) return null;
          return {
            key: `${link.fromLabel}->${link.toLabel}`,
            source,
            target,
            color: link.color ?? null,
          };
        }).filter(Boolean);

        const sel = linkLayer.selectAll("line.node-link")
          .data(linkData, (d) => d.key);

        const marginStart = 30;
        const marginEnd = 50;

        sel.join(
          enter => enter.append("line").attr("class", "node-link"),
          update => update,
          exit => exit.remove()
        )
          .attr("x1", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const len = Math.hypot(dx, dy) || 1;
            const m = Math.min(marginStart, len / 2);
            const f = m / len;
            return d.source.x + dx * f;
          })
          .attr("y1", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const len = Math.hypot(dx, dy) || 1;
            const m = Math.min(marginStart, len / 2);
            const f = m / len;
            return d.source.y + dy * f;
          })
          .attr("x2", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const len = Math.hypot(dx, dy) || 1;
            const m = Math.min(marginEnd, len / 2);
            const f = (len - m) / len;
            return d.source.x + dx * f;
          })
          .attr("y2", (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const len = Math.hypot(dx, dy) || 1;
            const m = Math.min(marginEnd, len / 2);
            const f = (len - m) / len;
            return d.source.y + dy * f;
          })
          .attr("stroke", (d) => d.color ? colourNameForArrowhead(d.color) : "black")
          .attr("stroke-width", 10)
          .attr("marker-end", (d) => "url(#" + (d.color ? getArrowheadId(d.color) : "arrowhead-black") + ")");
      } else {
        linkLayer.selectAll("line.node-link").remove();
      }
    }

    metricsUpdater.updateMetrics(Datasets.nodes, getCurrentSpawnQueue());
  }

  return { buildOrUpdateNodes, ticked };
}
