import * as d3 from "d3";
import { nodes, flipYCoordinates, fixInitially, collisionMargin } from "./js/data.js";
import { forceGaussianPreferredArea, forceCustomCollision } from "./js/forces.js";
import { createSvgAndContainer, createAxes, createArrowheads } from "./js/drawing.js";
import { createHeatmapGradients, buildHeatspotRects } from "./js/heatmaps.js";
import { setupUI, showForceArrows, showNetForce, showCoordinates } from "./js/ui.js";
import { spawnNodes } from './js/spawn.js';

// ========= parameters =========



// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Flip Y to treat up as positive
flipYCoordinates(nodes);

// 2) Fix initial nodes that are isFixed
fixInitially(nodes);

// 3) Create the SVG, container
const { svg, container, width, height } = createSvgAndContainer();
const minDim = Math.min(width, height);

// 4) Draw axes
const { xScale, yScale, xAxis, yAxis } = createAxes(container, width, height, minDim);

// 5) Arrowhead artefacts
const defs = svg.append("defs");
createArrowheads(svg);

// 6) Create the gradients by calling the new function
createHeatmapGradients(defs, nodes);

// 7) Then build the hotspot rects, also from the new function
buildHeatspotRects(container, nodes);


// ================================================================================================================
// =============== SPAWN ===============================================================================
// ================================================================================================================


// Create a group for each node
const nodeGroup = container.selectAll(".node-group")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`) // Positioning
    .on("dblclick", toggleFixed) // to toggle fixed state
    .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd)
    );

// Append circles inside the group (node circles)
nodeGroup.append("circle")
    .attr("fill", d => d.color)  // Node color
    .attr("opacity", 0.6)
    .attr("r", d => d.radius)
    .attr("stroke", d => d.isFixed ? "black" : "none") // Visual cue: Black stroke if fixed
    .attr("stroke-width", d => d.isFixed ? 3 : 0)
    ;

// Primary Label: node ID
nodeGroup.append("text")
    .attr("class", "id-label")
    .attr("dx", 0)  // Offset to the right of the circle
    .attr("dy", d => -d.radius - 2)   // Slightly above center
    .attr("text-anchor", "middle")
    .text(d => d.id)
    .attr("font-size", "20px")
    .attr("fill", "black")
    .attr("opacity", 0.5);

// Secondary Label: node coordinates
nodeGroup.append("text")
    .attr("class", "coord-label")
    .attr("dx", 0) //d => d.radius)  // to the right
    .attr("dy", d => d.radius + 15) // Below the node
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "black")
    .attr("opacity", 0.5);


// Force arrows container
const forceArrows = nodeGroup.append("g")
    .attr("class", "force-arrows");


// ================================================================================================================
// =============== SIMULATION LOGIC =======================================================================================
// ================================================================================================================

const simulation = d3.forceSimulation(nodes)
    .force("repel", d3.forceManyBody().strength(d => d.isFixed ? 0 : -50)) // Mild repulsion
    .force("collide", d3.forceCollide().radius(d => d.radius + collisionMargin).strength(1.2)) // Prevent overlap
    .force("gaussian", forceGaussianPreferredArea(1.5)) // Gaussian force for hotspots
    .force("customCollision", forceCustomCollision) // New collision force!
    .on("tick", ticked);


function ticked() {
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Update coordinates label
    if (showCoordinates) {
        nodeGroup.select(".coord-label")
            .text(d => `(${Math.round(d.x)}, ${Math.round(-d.y)})`);
    }
    
    // Update hotspot positions (for visualizing hotspot areas)
    // hotspotGroups.selectAll(".hotspot")
    //     .attr("x", d => d.x - d.width / 2)
    //     .attr("y", d => d.y - d.height / 2);

    // Clear previous arrows before drawing new ones
    forceArrows.selectAll(".force-arrow").remove();  

    nodeGroup.select("circle")
        .attr("stroke", d => d.isFixed ? "black" : "none")
        .attr("stroke-width", d => d.isFixed ? 3 : 0);

    // If arrows are off, no need to draw them.
    if (!showForceArrows) return;

    // // Enforce collision constraints AFTER forces are applied
    // nodes.forEach((d, i) => {
    //     nodes.forEach((other, j) => {
    //         if (i !== j) {
    //             const dx = d.x - other.x;
    //             const dy = d.y - other.y;
    //             const distance = Math.sqrt(dx * dx + dy * dy);
    //             const minDist = d.radius + other.radius + collisionMargin; // Include margin

    //             if (distance < minDist && distance > 0) {  
    //                 // Nodes are too close → Push them apart immediately
    //                 const overlap = minDist - distance;
    //                 const pushX = (dx / distance) * overlap * 0.5; // Half push each node
    //                 const pushY = (dy / distance) * overlap * 0.5;

    //                 if (!d.isFixed) { d.x += pushX * 0.5; d.y += pushY * 0.5; }
    //                 if (!other.isFixed) { other.x -= pushX; other.y -= pushY; }
    //             }
    //         }
    //     });
    // });

    // Add arrows based on the calculated forces
    nodeGroup.each(function(d) {
        const arrowGroup = d3.select(this).select(".force-arrows");

        // Draw individual force arrows (e.g., from hotspots)
        d.forces.forEach(force => {

            const length = Math.min(Math.sqrt(force.fx ** 2 + force.fy ** 2) * 2, 1000);
            const angle = Math.atan2(force.fy, force.fx);

            arrowGroup.append("line")
                .attr("class", "force-arrow")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", length * Math.cos(angle))
                .attr("y2", length * Math.sin(angle))
                .attr("stroke", force.source.includes("collision") ? "orange" : "white")
                .attr("stroke-width", 5)
                .attr("marker-end", "url(#arrowhead-"+(force.source.includes("collision") ? "orange" : "white")+")")
                .style("opacity", 0.5);
        });
        // Draw net force arrow in red, if showNetForce.
        if (showNetForce) {
            const netForceX = d.vx;
            const netForceY = d.vy;
            const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

            if (netForceMagnitude > 0.1) {
                const netLength = Math.min(netForceMagnitude * 5, 1000);
                const netAngle = Math.atan2(netForceY, netForceX);

                arrowGroup.append("line")
                    .attr("class", "force-arrow net-force-arrow")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", netLength * Math.cos(netAngle))
                    .attr("y2", netLength * Math.sin(netAngle))
                    .attr("stroke", "red")
                    .attr("stroke-width", 3)
                    .attr("marker-end", "url(#arrowhead)")
                    .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);
            }
        }
    });
}
    


// ================================================================================================================
// =============== Dragging & Toggling =======================================================================================
// ================================================================================================================

// Dragging behavior
    function dragStart(event, d) {
        simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnd(event, d) {
        if (!d.isFixed) { // Only release normal nodes
            d.fx = null;
            d.fy = null;
            simulation.alphaTarget(0);
        }
    }

    function toggleFixed(event, d) {
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


// ================================================================================================================
// =============== LISTENERS =======================================================================================
// ================================================================================================================

// 8) UI toggles
setupUI();


// ======== Browser window resize ================================

window.addEventListener("resize", onResize);

function onResize() {
    // 1) Calculate new width/height
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    svg.attr("width", newWidth).attr("height", newHeight);

    // 2) Determine scale based on the smaller dimension
    const scaleFactor = Math.min(newWidth, newHeight) / minDim;
    // baseDimension is some baseline—eg. the initial smaller dimension or a desired reference size.

    // 3) Translate to center, scale uniformly
    container.attr("transform",
    `translate(${newWidth/2}, ${newHeight/2}) scale(${scaleFactor})`
    );

    // 4) You can redraw axes or call `ticked()` if needed
    redrawAxes(); // if you have an axis you want to keep consistent
}