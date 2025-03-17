// addNode.js
import * as d3 from "d3";

/**
 * Adds a single new node to the given simulation & container, 
 * re-binds the data, and re-heats the simulation.
 *
 * @param {d3.Simulation} simulation - The D3 force simulation object.
 * @param {d3.Selection} container   - The main <g> container holding the node groups.
 * @param {Object} newNode           - The new node data object ({ id, x, y, color, radius, etc. }).
 * @param {Object} dragHandlers      - An object holding { dragStart, dragging, dragEnd } if needed.
 */
export function addNewNode(simulation, container, newNode, dragHandlers = {}) {
    console.log('spawning!');

  // 1) Insert the new node data into the sim
  const oldNodes = simulation.nodes();
  const newNodes = [...oldNodes, newNode];
  simulation.nodes(newNodes);

  // 2) Re-bind data to DOM
  const nodeGroup = container.selectAll(".node-group")
    .data(newNodes, d => d.id) // key by node id
    .join(
      enter => {
        // For newly entered node(s):
        const g = enter.append("g")
          .attr("class", "node-group");

        // If you have a drag behavior, attach it:
        if (dragHandlers.dragStart && dragHandlers.dragging && dragHandlers.dragEnd) {
          g.call(d3.drag()
            .on("start", dragHandlers.dragStart)
            .on("drag", dragHandlers.dragging)
            .on("end", dragHandlers.dragEnd)
          );
        }

        // For example, create a circle:
        g.append("circle")
          .attr("r", d => d.radius || 10)
          .attr("fill", d => d.color || "steelblue");

        // If you want a label:
        g.append("text")
          .attr("class", "id-label")
          .attr("text-anchor", "middle")
          .attr("dy", d => -(d.radius || 10) - 2)
          .text(d => d.id);

        // Return the enter selection
        return g;
      },
      update => update,  // optional update
      exit => exit.remove()
    );

  // 3) Re-heat the simulation so the new node can settle in
  simulation.alpha(1).restart();
}
