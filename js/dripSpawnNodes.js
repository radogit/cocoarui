// dripSpawnNodes.js

import { buildHeatspotRects } from "./heatmaps.js";
import { buildOrUpdateNodes } from "./../buildOrUpdateNodes.js";

/**
 * Timed "drip" approach to spawn nodes from a queue one at a time.
 *
 * @param {Array} nodesQueue     The array of node data to spawn over time.
 * @param {Array} nodes          The main node array in the simulation.
 * @param {d3.Selection} hotspotLayer The <g> container for hotspot rects.
 * @param {d3.Selection} nodeLayer    The <g> container for node groups.
 * @param {d3.Simulation} simulation  The d3 force simulation.
 * @param {number} intervalMs    How many milliseconds between spawns, default 1000.
 */
export function dripSpawnNodes(
  nodesQueue,
  nodes,
  hotspotLayer,
  nodeLayer,
  simulation,
  intervalMs = 1000
) {
  let i = 0; 
  const intervalId = setInterval(() => {
    if (i >= nodesQueue.length) {
      clearInterval(intervalId);
      return;
    }

    // Take the next node from the queue
    const newNode = nodesQueue[i];
    i++;

    // Add to the main node array
    nodes.push(newNode);

    // Re-run the hotspot data-join so new hotspots appear
    buildHeatspotRects(hotspotLayer, nodes);

    // Re-run the node data-join so new node circles/labels appear
    buildOrUpdateNodes(nodeLayer, nodes);

    // Let the simulation know about the new array
    simulation.nodes(nodes);
    simulation.alpha(1).restart();

  }, intervalMs);
}
