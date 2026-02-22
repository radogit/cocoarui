import * as d3 from "d3";

// Dragging behavior

/**
 * On drag start, fix the node so that it won't be forced around by the sim.
 */
export function dragStart(event, d, simulation) {
    simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

/**
 * While dragging, update the node's fx/fy to the drag position.
 */
export function dragging(event, d, simulation) {
    d.fx = event.x;
    d.fy = event.y;
  }

/**
 * On drag end, release the node if it's not fixed, so the sim can move it again.
 */
export function dragEnd(event, d, simulation) {
    if (!d.isFixed) {
      d.fx = null;
      d.fy = null;
      simulation.alphaTarget(0);
    }
  }

/**
 * Create setNodeFixed and toggleFixed handlers bound to a simulation.
 * @param {d3.Simulation} simulation
 * @returns {{ setNodeFixed: Function, toggleFixed: Function }}
 */
export function createNodeFixedHandlers(simulation) {
  function setNodeFixed(node, fixed) {
    node.isFixed = !!fixed;
    if (node.isFixed) {
      node.fx = node.x;
      node.fy = node.y;
    } else {
      node.fx = null;
      node.fy = null;
    }
    const sel = d3.select(`#node-group-${node.id}`).select("circle");
    if (!sel.empty()) {
      sel.classed("node-fixed", node.isFixed);
    }
    simulation.alpha(0.5).restart();
  }

  function toggleFixed(event, d) {
    setNodeFixed(d, !d.isFixed);
  }

  return { setNodeFixed, toggleFixed };
}
