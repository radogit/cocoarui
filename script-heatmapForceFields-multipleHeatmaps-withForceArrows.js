const width = 800, height = 600;

const nodes = [
    {
        id: "A", x: 550, y: 550, color: 'green', radius: 30, areaRadius: 100, hotspots: [
            { x: 450, y: 150, intensityFactor: 1.5, width: 200, height: 300 },
            { x: 600, y: 100, intensityFactor: 1.2, width: 120, height: 320 },
            { x: 700, y: 280, intensityFactor: 1.2, width: 320, height: 120 }
        ]
    },
    {
        id: "B", x: 300, y: 300, color: 'blue', radius: 40, areaRadius: 150, hotspots: [
            { x: 200, y: 300, intensityFactor: 1.2, width: 280, height: 100 },
            { x: 250, y: 550, intensityFactor: 1.0, width: 180, height: 80 }
        ]
    }
];

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const simulation = d3.forceSimulation(nodes)
    .force("repel", d3.forceManyBody().strength(-50)) // Mild repulsion
    .force("collide", d3.forceCollide().radius(d => d.radius + 5)) // Prevent overlap
    .force("gaussian", forceGaussianPreferredArea(1.5)) // Gaussian force for hotspots
    .on("tick", ticked);

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
        .style("stop-color", "white")
        .style("stop-opacity", 0);
});

// Create hotspot rectangles for each node
const hotspotGroups = svg.selectAll(".hotspot-group")
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
    .style("opacity", 0.9)
;

// Create a group for each node
const nodeGroup = svg.selectAll(".node-group")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`) // Positioning
    .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd)
    );

// Append circles inside the group (node circles)
nodeGroup.append("circle")
    .attr("fill", d => d.color)  // Node color
    .attr("r", d => d.radius);

// Append labels inside the group
nodeGroup.append("text")
    .attr("dx", 0)  // Offset to the right of the circle
    .attr("dy", d => -d.radius - 2)   // Slightly above center
    .attr("text-anchor", "middle")
    .text(d => d.id)
    .attr("font-size", "12px")
    .attr("fill", "black");

// Create a new group for the force arrows that will be inside each node's group
const forceArrows = nodeGroup.append("g")  // Add this line to ensure arrows are inside the node group
    .attr("class", "force-arrows");

// Define arrowhead marker for better visualization
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", "white");

function ticked() {
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Update hotspot positions (for visualizing hotspot areas)
    hotspotGroups.selectAll(".hotspot")
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2);

    // Clear previous arrows before drawing new ones
    forceArrows.selectAll(".force-arrow").remove();  

    // Add arrows based on the calculated forces
    nodeGroup.each(function(d) {
        const netForceX = d.vx;  // Total force from all sources
        const netForceY = d.vy;
        const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

        // Visual clarity: Net force should have a slightly transparent arrow
        const netAlpha = netForceMagnitude > 0.9 ? 0.8 : 0.5;  

        // Draw individual force arrows (e.g., from hotspots)
        d.forces.forEach(force => {
            const length = Math.min(Math.sqrt(force.fx ** 2 + force.fy ** 2) * 0.5, 100);
            const angle = Math.atan2(force.fy, force.fx);

            d3.select(this).select(".force-arrows")
                .append("line")
                .attr("class", "force-arrow")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", length * Math.cos(angle))
                .attr("y2", length * Math.sin(angle))
                .attr("stroke", "white")
                .attr("stroke-width", 5)
                .attr("marker-end", "url(#arrowhead)")
                .style("opacity", 0.9);
        });

        // Draw net force arrow (captures forces like collisions)
        if (netForceMagnitude > 0.1) {  // Only draw if non-trivial
            const netLength = Math.min(netForceMagnitude * 10, 100);
            const netAngle = Math.atan2(netForceY, netForceX);

            d3.select(this).select(".force-arrows")
                .append("line")
                .attr("class", "force-arrow net-force-arrow")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", netLength * Math.cos(netAngle))
                .attr("y2", netLength * Math.sin(netAngle))
                .attr("stroke", "red")  // Different color for net force
                .attr("stroke-width", 3)
                .attr("marker-end", "url(#arrowhead)")
                .style("opacity", netAlpha);
        }
    });
}
    

// Custom force for Gaussian-like interaction between nodes and multiple hotspots
function forceGaussianPreferredArea(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            d.forces = [];
            d.hotspots.forEach(hotspot => {
                const dx = d.x - hotspot.x;
                const dy = d.y - hotspot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 1) {
                    const force = Math.exp(-distance / hotspot.width) * strength;
                    d.vx -= dx * force * alpha;
                    d.vy -= dy * force * alpha;
                    d.forces.push({ fx: -dx * force, fy: -dy * force });
                }
            });
        });
    };
}

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
    d.fx = null;
    d.fy = null;
    simulation.alphaTarget(0);
}
