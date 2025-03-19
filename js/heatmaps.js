import * as d3 from "d3";
import {showObservations} from "./ui.js";

/**
 * Creates radial gradients for each node in `nodes`.
 * 
 * @param {d3.Selection} defs 
 * @param {Array} nodes The array of node objects with .id and .color.
 */
export function createHeatmapGradients(defs, nodes, colours) {

    const heatmapGradientContainer = defs.append("heatmapGradients");

    // Define gradients for each node's hotspots dynamically
    colours.forEach(colour => {
        // Create a unique radial gradient for each node's hotspots
        const gradient = heatmapGradientContainer.append("radialGradient")
            .attr("id", `forceGradient-${colour}`)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
    
        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", colour)  // Use node's color for the center
            .style("stop-opacity", 0.4);
    
        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", colour)
            .style("stop-opacity", 0.1);
    });
}


/**
 * Builds hotspot rectangles for each node, placing them in a `<g.hotspot-group>` 
 * with `<rect>` elements inside that group.
 * 
 * @param {d3.Selection} container The main <g> container for your simulation.
 * @param {Array} nodes The array of node objects, each with .hotspots array
 */
export function buildHeatspotRects(container, nodes){

    // Create hotspot rectangles for each node
    const hotspotGroups = container.selectAll(".hotspot-group")
        .data(nodes, d => d.id)
        .join("g")
        .attr("class", showObservations ? "hotspot-group" : "hotspot-group hidden");
    
    hotspotGroups.selectAll(".hotspot")
        .data(d => d.hotspots)
        .join(
            // ========== Enter logic for new rects ==========
            enter => {
              // Create newly entered <rect> elements
              const r = enter.append("rect")
                .attr("class", "hotspot");
      
              // Log a message for each newly entered rect
              r.each(function(h) {
                const nodeData = d3.select(this.parentNode).datum(); 
                // (the node that owns these hotspots)
                console.log(
                  `New hotspot for node '${nodeData.id}' — size: ${h.width.toFixed(0)}x${h.height.toFixed(0)}, position: (${h.x.toFixed(0)}, ${h.y.toFixed(0)})`
                );
              });
      
              // Return the newly created selection so D3 can handle update logic
              return r;
            },
            // ========== Update logic (optional) ==========
            update => update,
            // ========== Exit logic ==========
            exit => exit.remove()
          )
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .each(function(d) {
            // Ensure each hotspot references the correct node ID dynamically
            d.nodeId = d3.select(this.parentNode).datum().id;
            d.color = d3.select(this.parentNode).datum().color;
        })
        .style("fill", d => `url(#forceGradient-${d.color})`)  // Correctly associate hotspot with node's gradient
        .style("stroke", d=>d.color)        // Thin black border
        .style("stroke-width", 1)        // Border thickness
        .style("stroke-dasharray", "4,2") // Dashed border (4px dash, 2px space)    
        .style("opacity", 0.3)
    ;
    
}