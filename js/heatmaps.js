import * as d3 from "d3";

/**
 * Creates radial gradients for each node in `nodes`.
 * 
 * @param {d3.Selection} defs 
 * @param {Array} nodes The array of node objects with .id and .color.
 */
export function createHeatmapGradients(defs, nodes) {

    // Define gradients for each node's hotspots dynamically
    nodes.forEach(node => {
        // Create a unique radial gradient for each node's hotspots
        const gradient = defs.append("radialGradient")
            .attr("id", `forceGradient-${node.id}`)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
    
        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", node.color)  // Use node's color for the center
            .style("stop-opacity", 0.4);
    
        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", node.color)
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
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "hotspot-group");
    
    hotspotGroups.selectAll(".hotspot")
        .data(d => d.hotspots)
        .enter()
        .append("rect")
        .attr("class", "hotspot")
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .each(function(d) {
            // Ensure each hotspot references the correct node ID dynamically
            d.nodeId = d3.select(this.parentNode).datum().id;
            d.color = d3.select(this.parentNode).datum().color;
        })
        .style("fill", d => `url(#forceGradient-${d.nodeId})`)  // Correctly associate hotspot with node's gradient
        .style("stroke", d=>d.color)        // Thin black border
        .style("stroke-width", 1)        // Border thickness
        .style("stroke-dasharray", "4,2") // Dashed border (4px dash, 2px space)    
        .style("opacity", 0.3)
    ;
    
}