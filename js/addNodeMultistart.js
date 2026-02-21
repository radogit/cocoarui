/**
 * Multistart grid search for optimal node placement.
 * Tries every point of a grid, keeps the location with the highest "cancellation" score.
 */
import * as d3 from "d3";
import * as Forces from "./forces.js";
import * as Heatmaps from "./heatmaps.js";
import * as AppUI from "./ui.js";
import { getArrowheadId } from "./colours.js";

/**
 * @param {Array} nodes          main data array (is mutated)
 * @param {Object} template      blueprint of the new node (cloned)
 * @param {d3.Simulation} simulation
 * @param {Number} width
 * @param {Number} height
 * @param {d3.Selection} defs
 * @param {d3.Selection} windLayerCancel
 * @param {d3.Selection} windLayerStress
 * @param {d3.Selection} windLayerNetForceArrows
 * @param {Number} minDim        smaller of width/height
 * @param {Number} scaleUnit
 * @param {d3.Selection} nodeLayer
 * @param {Number} ticks
 * @param {Number} gridCols
 * @param {Number} gridRows
 */
export async function addNodeWithMultistartVisual(
  nodes, template, simulation,
  width, height, defs,
  windLayerCancel, windLayerStress, windLayerNetForceArrows,
  minDim, scaleUnit, nodeLayer,
  ticks = 80,
  gridCols = 18,
  gridRows = 18
) {
  let highestStress = -Infinity;
  let lowestStress = Infinity;
  let highestCancel = -Infinity;
  let longestArrow = -Infinity;
  let bestClone = null;
  const dx = minDim / gridCols;
  const dy = minDim / gridRows;

  const windLayerCancelChildren = document.getElementById(AppUI.showWindCancel.DOMObjectString)?.childNodes;
  if (windLayerCancelChildren) {
    windLayerCancelChildren.forEach((child) => child.setAttribute("opacity", 0));
  }
  const windLayerStressChildren = document.getElementById(AppUI.showWindStress.DOMObjectString)?.childNodes;
  if (windLayerStressChildren) {
    windLayerStressChildren.forEach((child) => child.setAttribute("opacity", 0));
  }
  const windLayerNetForceArrowChildren = document.getElementById(AppUI.showWindNetForceArrows.DOMObjectString)?.childNodes;
  if (windLayerNetForceArrowChildren) {
    windLayerNetForceArrowChildren.forEach((child) => child.setAttribute("opacity", 0));
  }

  const gCancel = windLayerCancel.append("g")
    .attr("id", "spawn-cand-cancel-" + template.id)
    .attr("class", AppUI.showWindCancel.boolState ? AppUI.showWindCancel.DOMObjectString : AppUI.showWindCancel.DOMObjectString + " hidden")
    .attr("style", "transition: all ease-in-out 0.2s;")
    .attr("opacity", "0.5");
  const gStress = windLayerStress.append("g")
    .attr("id", "spawn-cand-stress-" + template.id)
    .attr("class", AppUI.showWindStress.boolState ? AppUI.showWindStress.DOMObjectString : AppUI.showWindStress.DOMObjectString + " hidden")
    .attr("style", "transition: all ease-in-out 0.2s;")
    .attr("opacity", "0.5");
  const gNetForceArrows = windLayerNetForceArrows.append("g")
    .attr("id", "spawn-cand-netForceArrow-" + template.id)
    .attr("class", AppUI.showWindNetForceArrows.boolState ? AppUI.showWindNetForceArrows.DOMObjectString : AppUI.showWindNetForceArrows.DOMObjectString + " hidden")
    .attr("style", "transition: all ease-in-out 0.2s;")
    .attr("opacity", "0.5");

  for (let gy = 0; gy < gridRows; gy++) {
    for (let gx = 0; gx < gridCols; gx++) {
      const cx = (gx + 0.5) * dx - minDim / 2;
      const cy = (gy + 0.5) * dy - minDim / 2;

      const cand = structuredClone(template);
      cand.x = cx;
      cand.y = cy;
      cand.id += `-g${gx}-${gy}`;

      cand.hotspots.forEach((h) => Heatmaps.ensureColourGradient(defs, cand.color));

      nodes.push(cand);
      const mini = d3.forceSimulation(nodes.concat(cand))
        .force("gauss", Forces.forceGaussianPreferredArea(1.5))
        .force("coll", Forces.forceCustomCollision);
      mini.tick();
      const netForceX = cand.vx;
      const netForceY = cand.vy;
      for (let t = 1; t < ticks; t++) mini.tick();
      mini.stop();

      const stress = cand.forces.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0);
      const sx = cand.forces.reduce((s, f) => s + f.fx, 0);
      const sy = cand.forces.reduce((s, f) => s + f.fy, 0);
      const cancel = stress - Math.hypot(sx, sy);

      const trialGCancel = gCancel.append("g").attr("transform", `translate(${cx},${cy})`);
      trialGCancel.append("rect")
        .attr("cancel", cancel)
        .attr("width", dx).attr("height", dy)
        .attr("x", -dx / 2).attr("y", -dy / 2)
        .attr("fill", cand.color).attr("fill-opacity", 0.125 * cancel / 10);
      trialGCancel.append("text")
        .attr("class", AppUI.showWindCancelLabel.boolState ? AppUI.showWindCancelLabel.DOMObjectString + " graph-label" : AppUI.showWindCancelLabel.DOMObjectString + " graph-label hidden")
        .attr("x", 0).attr("dy", "20px")
        .append("tspan").text(`${cancel.toFixed(1)}`).attr("dy", "0em");

      const trialGStress = gStress.append("g").attr("transform", `translate(${cx},${cy})`);
      trialGStress.append("rect")
        .attr("stress", stress)
        .attr("width", dx).attr("height", dy)
        .attr("x", -dx / 2).attr("y", -dy / 2)
        .attr("fill", cand.color).attr("fill-opacity", 0.125 * stress / 10);
      trialGStress.append("text")
        .attr("class", AppUI.showWindStressLabel.boolState ? AppUI.showWindStressLabel.DOMObjectString + " graph-label" : AppUI.showWindStressLabel.DOMObjectString + " graph-label hidden")
        .attr("x", 0).attr("dy", "20px")
        .append("tspan").text(`${stress.toFixed(1)}`).attr("dy", "1.2em");

      const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);
      const netLength = Math.min(netForceMagnitude * 5, 1000);
      const netAngle = Math.atan2(netForceY, netForceX);
      const trialGNetForceArrows = gNetForceArrows.append("g").attr("transform", `translate(${cx},${cy})`);
      trialGNetForceArrows.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", netLength * Math.cos(netAngle))
        .attr("y2", netLength * Math.sin(netAngle))
        .attr("netForceMagnitude", netForceMagnitude)
        .attr("netLength", netLength)
        .attr("stroke", cand.color)
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#" + getArrowheadId(cand.color) + ")")
        .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);

      if (cancel > highestCancel) highestCancel = cancel;
      if (stress < lowestStress) lowestStress = stress;
      if (stress > highestStress) {
        highestStress = stress;
        bestClone = structuredClone(cand);
      }
      if (netLength > longestArrow) longestArrow = netLength;

      nodes.pop();
      nodeLayer.selectAll(".node-group").filter((d) => d.id === cand.id).remove();
    }
  }

  const safeHighestCancel = highestCancel > 0 && isFinite(highestCancel) ? highestCancel : 1;
  const safeHighestStress = highestStress > 0 && isFinite(highestStress) ? highestStress : 1;
  const spawnCandCancel = document.getElementById("spawn-cand-cancel-" + template.id)?.childNodes;
  if (spawnCandCancel) {
    spawnCandCancel.forEach((child) => {
      const el = child.firstChild;
      if (!el) return;
      const cancel = Number(el.getAttribute("cancel")) || 0;
      el.setAttribute("fill-opacity", 0.5 * cancel / safeHighestCancel);
      el.setAttribute("r", dx / 2 * cancel / safeHighestCancel);
    });
  }
  const spawnCandStress = document.getElementById("spawn-cand-stress-" + template.id)?.childNodes;
  if (spawnCandStress) {
    spawnCandStress.forEach((child) => {
      const el = child.firstChild;
      if (!el) return;
      const stress = Number(el.getAttribute("stress")) || 0;
      el.setAttribute("fill-opacity", 0.5 * stress / safeHighestStress);
    });
  }
  const spawnCandNetForce = document.getElementById("spawn-cand-netForceArrow-" + template.id)?.childNodes;
  const safeLongest = longestArrow > 0 && isFinite(longestArrow) ? longestArrow : 1;
  if (spawnCandNetForce) {
    spawnCandNetForce.forEach((child) => {
      const line = child.firstChild;
      if (!line) return;
      const netLength = Number(line.getAttribute("netLength")) || 0;
      const netForceArrowRank = netLength / safeLongest;
      const x2 = Number(line.getAttribute("x2")) || 0;
      const y2 = Number(line.getAttribute("y2")) || 0;
      const newX2 = (x2 / safeLongest) * netForceArrowRank * dx / 2;
      const newY2 = (y2 / safeLongest) * netForceArrowRank * dy / 2;
      line.setAttribute("x2", isFinite(newX2) ? newX2 : 0);
      line.setAttribute("y2", isFinite(newY2) ? newY2 : 0);
    });
  }

  bestClone.id = template.id;
  console.log("spawned " + bestClone.id + " at " + (bestClone.x / scaleUnit).toFixed(0) + ", " + (-bestClone.y / scaleUnit).toFixed(0));
  nodes.splice(nodes.length, 0, bestClone);
  simulation.nodes(nodes).alpha(1).restart();
}
