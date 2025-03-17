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

/**
 * When a user double-clicks a node, toggle its isFixed state
 * and adjust .fx, .fy as needed.
 */
export function toggleFixed(event, d, simulation) {
    d.isFixed = !d.isFixed;
    if (d.isFixed) {
      d.fx = d.x;
      d.fy = d.y;
    } else {
      d.fx = null;
      d.fy = null;
    }

    // restyle the circle stroke
    event.currentTarget.querySelector("circle")
        ?.setAttribute("stroke", d.isFixed ? "black" : "none");
    // d3.select(this).select("circle")
    //     .transition().duration(200)
    //     .attr("stroke", d.isFixed ? "black" : "none") // Visual cue: Black stroke if fixed
    //     .attr("stroke-width", d.isFixed ? 3 : 0);

    // Reheat the simulation a bit:
    simulation.alpha(0.5).restart();
}