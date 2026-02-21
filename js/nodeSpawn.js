/**
 * Node spawn, add, and remove operations.
 * Use createNodeSpawn(ctx) to get functions bound to your app context.
 */
import * as d3 from "d3";
import * as Datasets from "./datasets.js";
import * as Heatmaps from "./heatmaps.js";
import * as AppUI from "./ui.js";
import { addNodeWithMultistartVisual } from "./addNodeMultistart.js";
import { colours } from "./colours.js";
import * as Icons from "./icons.js";

/**
 * Generate random hotspot objects for a node.
 * @param {number} minDim - smaller of width/height (canvas extent)
 * @param {number} n - number of hotspots
 */
export function randomHotspots(minDim, n = 1) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      x: minDim * (Math.random() - 0.5),
      y: minDim * (Math.random() - 0.5),
      intensityFactor: 1.0,
      width: 40 + 160 * Math.random(),
      height: 40 + 160 * Math.random(),
      forceType: "attract",
    });
  }
  return arr;
}

/**
 * Wait until a node "settles" (speed below threshold for some time).
 * @param {Object} node - node object with vx, vy
 * @param {Array} nodes - main nodes array (to detect removal)
 * @param {d3.Simulation} simulation
 * @param {Object} opts - { speedThreshold, stableMs, checkInterval }
 */
export async function waitForNodeToSettle(node, nodes, simulation, {
  speedThreshold = 0.5,
  stableMs = 800,
  checkInterval = 80,
} = {}) {
  return new Promise((resolve) => {
    if (!node) return resolve();

    let stableFor = 0;

    const intervalId = setInterval(() => {
      if (!nodes.includes(node)) {
        clearInterval(intervalId);
        return resolve();
      }

      const vx = node.vx ?? 0;
      const vy = node.vy ?? 0;
      const speed = Math.hypot(vx, vy);

      if (speed < speedThreshold) {
        stableFor += checkInterval;
        if (stableFor >= stableMs) {
          clearInterval(intervalId);
          resolve();
        }
      } else {
        stableFor = 0;
      }
    }, checkInterval);
  });
}

let currentSpawnQueue = null;

/** Return the current spawn queue (for metrics table) or null. */
export function getCurrentSpawnQueue() {
  return currentSpawnQueue;
}

export function clearSpawnQueue() {
  if (currentSpawnQueue) currentSpawnQueue.length = 0;
  currentSpawnQueue = null;
}

/**
 * Create node spawn/add/remove operations bound to the given context.
 * @param {Object} ctx
 * @param {Array} ctx.nodes - main nodes array (e.g. Datasets.nodes)
 * @param {Array} ctx.activeLinks - mutable array of link objects (cleared on removeAll)
 * @param {d3.Selection} ctx.linkLayer
 * @param {d3.Selection} ctx.hotspotLayer
 * @param {d3.Selection} ctx.nodeLayer
 * @param {d3.Selection} ctx.windLayerCancel
 * @param {d3.Selection} ctx.windLayerStress
 * @param {d3.Selection} ctx.windLayerNetForceArrows
 * @param {d3.Simulation} ctx.simulation
 * @param {Function} ctx.buildOrUpdateNodes
 * @param {Object} ctx.defs
 * @param {number} ctx.width
 * @param {number} ctx.height
 * @param {number} ctx.minDim
 * @param {number} ctx.scaleUnit
 * @param {Object} ctx.sequenceModeRef - { value: string }
 */
export function createNodeSpawn(ctx) {
  const {
    nodes,
    activeLinks,
    linkLayer,
    hotspotLayer,
    nodeLayer,
    windLayerCancel,
    windLayerStress,
    windLayerNetForceArrows,
    simulation,
    buildOrUpdateNodes,
    defs,
    width,
    height,
    minDim,
    scaleUnit,
    sequenceModeRef,
  } = ctx;

  async function addOneSmart() {
    const template = {
      id: "random-" + Date.now().toString(36).slice(-4),
      color: colours[Math.floor(Math.random() * colours.length)],
      radius: 10 + 30 * Math.random(),
      representation: Icons.randomRepresentation(),
      isFixed: false,
      significance: 1,
      hotspots: randomHotspots(minDim, Math.floor(Math.random() * 4) + 2),
    };

    await addNodeWithMultistartVisual(
      nodes,
      template,
      simulation,
      width,
      height,
      defs,
      windLayerCancel,
      windLayerStress,
      windLayerNetForceArrows,
      minDim,
      scaleUnit,
      nodeLayer,
      80,
      18,
      18
    );
    Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);
    buildOrUpdateNodes(nodeLayer, nodes);
    simulation.nodes(nodes);
    simulation.alpha(1).restart();
  }

  function dripSpawnSmart(nodesQueue, intervalMs = 1000) {
    return new Promise((resolve) => {
      const todo = nodesQueue.slice();
      currentSpawnQueue = todo;

      async function next() {
        if (todo.length === 0) {
          currentSpawnQueue = null;
          resolve();
          return;
        }

        const raw = structuredClone(todo.shift());
        raw.id += "-" + Date.now().toString(36).slice(-4);

        if (raw.color === "random") {
          raw.color = colours[Math.floor(Math.random() * colours.length)];
        }

        Datasets.adjustCoordinatesToScale([raw], scaleUnit);
        Datasets.flipYCoordinates([raw]);
        Datasets.fixInitially([raw]);

        await addNodeWithMultistartVisual(
          nodes,
          raw,
          simulation,
          width,
          height,
          defs,
          windLayerCancel,
          windLayerStress,
          windLayerNetForceArrows,
          minDim,
          scaleUnit,
          nodeLayer,
          80,
          18,
          18
        );

        Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);
        buildOrUpdateNodes(nodeLayer, nodes);
        simulation.nodes(nodes).alpha(1).restart();

        const spawned = nodes.find((n) => n.id === raw.id);

        await waitForNodeToSettle(spawned, nodes, simulation, {
          speedThreshold: 0.5,
          stableMs: 800,
          checkInterval: 80,
        });

        if (spawned && sequenceModeRef.value === "fixing") {
          spawned.isFixed = true;
          spawned.fx = spawned.x;
          spawned.fy = spawned.y;
          const sel = d3.select(`#node-group-${spawned.id}`).select("circle");
          sel.attr("stroke", "black").attr("stroke-width", 3);
          simulation.alpha(0.5).restart();
        }

        next();
      }

      next();
    });
  }

  function removeNodeById(id) {
    const idx = nodes.findIndex((n) => n.id === id);
    if (idx === -1) return;
    nodes.splice(idx, 1);

    d3.select(`#node-group-${id}`).remove();
    d3.select(`#hotspot-group-${id}`).remove();
    d3.select(`#spawn-cand-stress-${id}`).remove();
    d3.select(`#spawn-cand-cancel-${id}`).remove();
    d3.select(`#spawn-cand-netForceArrow-${id}`).remove();

    Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);
    buildOrUpdateNodes(nodeLayer, nodes);
    simulation.nodes(nodes).alpha(1).restart();
  }

  function removeAllNodes() {
    console.log("removed all nodes.", "red");
    nodes.splice(0, nodes.length);
    if (activeLinks) activeLinks.splice(0, activeLinks.length);
    if (linkLayer) linkLayer.selectAll("*").remove();

    document.getElementById(AppUI.showWindStress.DOMObjectString).innerHTML = "";
    document.getElementById(AppUI.showWindCancel.DOMObjectString).innerHTML = "";
    document.getElementById(AppUI.showWindNetForceArrows.DOMObjectString).innerHTML = "";

    buildOrUpdateNodes(nodeLayer, nodes);
    Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);
    simulation.nodes(nodes);
    simulation.alpha(1).restart();
  }

  return {
    addOneSmart,
    dripSpawnSmart,
    removeNodeById,
    removeAllNodes,
  };
}
