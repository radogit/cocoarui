import * as d3 from "d3";

// Dragging behavior

export function dragStart(event, d) {
        simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

export function dragging(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

export function dragEnd(event, d) {
    if (!d.isFixed) { // Only release normal nodes
        d.fx = null;
        d.fy = null;
        simulation.alphaTarget(0);
    }
}

export function toggleFixed(event, d) {
    // We only allow toggling if the user wants to.
    // If you want a separate checkbox to enable/disable toggling, do so.
    d.isFixed = !d.isFixed; // Toggle fixed state

    if (d.isFixed) {
        d.fx = d.x; // Lock position
        d.fy = d.y;
    } else {
        d.fx = null; // Allow movement
        d.fy = null;
    }

    d3.select(this).select("circle")
        .transition().duration(200)
        .attr("stroke", d.isFixed ? "black" : "none") // Visual cue: Black stroke if fixed
        .attr("stroke-width", d.isFixed ? 3 : 0);

    simulation.alpha(0.5).restart(); // Restart simulation for immediate effect // 0.5 instead of 1 for a Less aggressive restart
}
