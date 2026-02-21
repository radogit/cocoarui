// import * as d3 from "d3";

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
