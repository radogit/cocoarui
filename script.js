import * as d3 from "d3";
import { nodes, flipYCoordinates, fixInitially, collisionMargin } from "./js/data.js";

// ========= parameters =========

// Global toggle states
let showNodeLabel = true;
let showForceArrows = true;
let showNetForce = true;
let showCoordinates = true;

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Flip Y to treat up as positive
flipYCoordinates(nodes);

// 2) Fix initial nodes that are isFixed
fixInitially(nodes);

// todo: UI control panel - enact the above hardcoded choices onto the html file

    
// ========= draw the world =========
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDim = Math.min(width, height);
    console.log(180/Math.min(width, height));

    const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// centering the simulation's coordinate system within the browser canvas
    const container = svg.append("g")
        .attr("class", "container")
        .attr("transform", `translate(${width/2},${height/2})`);

// axis
    const domainExtent = 90;

    const yScale = d3.scaleLinear()
    .domain([-domainExtent, domainExtent]) 
    .range([ minDim/2, -minDim/2 ]); 

    const xScale = d3.scaleLinear()
    .domain([-domainExtent, domainExtent])  // the domain of x-values in your centered coords
    .range([-minDim/2, minDim/2]);  // visually, negative is left, positive is right
    

    // Create a left-axis generator
    const yAxis = d3.axisLeft(yScale).ticks(10);
    const xAxis = d3.axisBottom(xScale).ticks(10); // choose how many ticks you want

    // Append the axis at x=0
    container.append("g")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);

    // Then draw the x-axis at (x=0, y=0)
    container.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0,0)") // y=0 means horizontal line across center
    .call(xAxis);




// ================================================================================================================
// =============== SPAWN ===============================================================================
// ================================================================================================================

// Define gradients for each node's hotspots dynamically
const defs = svg.append("defs");

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

// Create hotspot rectangles for each node
const hotspotGroups = container.selectAll(".hotspot-group")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "hotspot-group");

// Create each hotspot rectangle for a node
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

// Create the tooltip div and style it
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "lightsteelblue")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 10px rgba(0, 0, 0, 0.1)")
    .style("font-size", "14px");


// Force arrows container
const forceArrows = nodeGroup.append("g")
    .attr("class", "force-arrows");

// Arrowheads
svg.append("defs").append("marker")
    .attr("id", "arrowhead-white")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", "white")
    ;
svg.append("defs").append("marker")
    .attr("id", "arrowhead-orange")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", "orange")
    ;
    
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
    hotspotGroups.selectAll(".hotspot")
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2);

    hotspotGroups.selectAll(".hotspot")
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2);

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
    
// ==================== Forces & Collisions ========================

// Custom force for Gaussian-like interaction between nodes and multiple hotspots
function forceGaussianPreferredArea(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            d.forces = []; // Reset all force vectors

            // Apply Hotspot Forces (Attract/Repel)
            d.hotspots.forEach(hotspot => {
                const dx = hotspot.x - d.x;
                const dy = hotspot.y - d.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 1) {
                    const force = Math.exp(-distance / hotspot.width) * strength * hotspot.intensityFactor;

                    // Check the force type: attract vs. repel
                    const fx = hotspot.forceType === "attract" ? dx * force : -dx * force;
                    const fy = hotspot.forceType === "attract" ? dy * force : -dy * force;

                    d.vx += fx * alpha;
                    d.vy += fy * alpha;
                    //d.forces.push({ fx: -dx * force, fy: -dy * force });
                    d.forces.push({ fx, fy, source: "hotspot" });
                }
            });

            // Node-to-node collision (soft approach)
            nodes.forEach(other => {
                if (d !== other) {
                    const dx = other.x - d.x;
                    const dy = other.y - d.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDist = d.radius + other.radius + collisionMargin; // Include margin
                    //if(d.id=="B" && minDist>distance){console.log('distance of B to '+other.id+': '+distance + ' which is less than the midDist of' +minDist );}
            
                    if (distance < minDist) {
                        const overlapRatio = 1 - distance / minDist; // How much they overlap (0 to 1)
                        const force = (overlapRatio ** 2) * alpha * 5; // Quadratic falloff for smooth response
            
                        // Normalize direction and push nodes apart
                        const pushX = (dx / distance) * (minDist - distance); 
                        const pushY = (dy / distance) * (minDist - distance);
            
                        d.vx -= pushX * alpha * 0.5; // Scale down to prevent excessive movement
                        d.vy -= pushY * alpha * 0.5;
            
                        d.forces.push({ fx: -pushX, fy: -pushY, source: `collision with ${other.id}` });
                    }
                }
            });
        });
    };
}

function forceCustomCollision(alpha) {
    nodes.forEach((d, i) => {
        nodes.forEach((other, j) => {
            if (i !== j) {
                const dx = d.x - other.x;
                const dy = d.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDist = d.radius + other.radius + collisionMargin;

                if (distance < minDist && distance > 0) {
                    const overlapRatio = 1 - distance / minDist;
                    const force = (overlapRatio ** 2) * alpha * 5;

                    // Normalize direction
                    const pushX = (dx / distance) * force;
                    const pushY = (dy / distance) * force;

                    // Determine how to distribute the force
                    if (!d.isFixed && !other.isFixed) {
                        // // Both nodes are movable → Split force evenly
                        // d.vx += pushX * 0.5;
                        // d.vy += pushY * 0.5;
                        // other.vx -= pushX * 0.5;
                        // other.vy -= pushY * 0.5;
                        const weight1 = d.significance || 1; // Default 1 if not defined
                        const weight2 = other.significance || 1;
                        const totalWeight = weight1 + weight2;
                        //console.log(d.significance + ' vs. ' + other.significance);
                        
                        const dWeight = weight2 / totalWeight;
                        const otherWeight = weight1 / totalWeight;

                        d.vx += pushX * dWeight;
                        d.vy += pushY * dWeight;
                        other.vx -= pushX * otherWeight;
                        other.vy -= pushY * otherWeight;
                    } else if (!d.isFixed) {
                        // `d` is movable, `other` is fixed → `d` takes full force
                        d.vx += pushX;
                        d.vy += pushY;
                    } else if (!other.isFixed) {
                        // `other` is movable, `d` is fixed → `other` takes full force
                        other.vx -= pushX;
                        other.vy -= pushY;
                    }
                }
            }
        });
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

// ======== UI control panel logic ================================

    const toggleNodeLabel = document.getElementById("toggleNodeLabel");
    if (toggleNodeLabel) {
        toggleNodeLabel.addEventListener("change", function() {
            showNodeLabel = this.checked;
            // Hide/show node labels
            svg.selectAll(".id-label")
                .style("display", showNodeLabel ? null : "none");
    });
    }

    const toggleForceArrowsInput = document.getElementById("toggleForceArrows");
    if (toggleForceArrowsInput) {
        toggleForceArrowsInput.addEventListener("change", function() {
            showForceArrows = this.checked;
            // Hide/show the forceArrows group
            svg.selectAll(".force-arrows")
                .style("display", showForceArrows ? null : "none");
        });
    }

    const toggleNetForceInput = document.getElementById("toggleNetForce");
    if (toggleNetForceInput) {
    toggleNetForceInput.addEventListener("change", function() {
        showNetForce = this.checked;
    });
    }

    const toggleCoordinatesInput = document.getElementById("toggleCoordinates");
    if (toggleCoordinatesInput) {
        toggleCoordinatesInput.addEventListener("change", function() {
            showCoordinates = this.checked;
            // Hide/show coord-label elements
            svg.selectAll(".coord-label")
                .style("display", showCoordinates ? null : "none");
        });
    }

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