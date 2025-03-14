const width = 800, height = 600;

const nodes = [
    { id: "A", x: 550, y: 550, radius: 30, xArea: 550, yArea: 550, areaRadius: 100 },
    { id: "B", x: 250, y: 300, radius: 40, xArea: 250, yArea: 300, areaRadius: 120 }
];

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const simulation = d3.forceSimulation(nodes)
    .force("repel", d3.forceManyBody().strength(-50)) // Repulsion
    .force("collide", d3.forceCollide().radius(d => d.radius + 5)) // Collision
    .force("heatmap", forceHeatmapAttraction(1.1)) // Heatmap-based attraction
    .on("tick", ticked);

const defs = svg.append("defs");

// Create individual gradient definitions for each node's heatmap
nodes.forEach(node => {
    const gradient = defs.append("radialGradient")
        .attr("id", `heatGradient-${node.id}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

    gradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", "red")
        .style("stop-opacity", 0.6);

    gradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", "white")
        .style("stop-opacity", 0);
});

// Visualize each node's heatmap circle
const areaCircles = svg.selectAll(".area")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "area")
    .attr("cx", d => d.xArea)
    .attr("cy", d => d.yArea)
    .attr("r", d => d.areaRadius)
    .style("fill", d => `url(#heatGradient-${d.id})`)
    .style("opacity", 0.4)
    .lower();  // Keep them in the background

// Create the nodes and their dragging behavior
const nodeGroup = svg.selectAll(".node-group")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd));

nodeGroup.append("circle")
    .attr("fill", (d, i) => i === 0 ? "red" : "blue")
    .attr("r", d => d.radius);

nodeGroup.append("text")
    .attr("dx", 0)
    .attr("dy", d => -d.radius-2)
    .attr("text-anchor", "middle")
    .text(d => d.id)
    .attr("font-size", "12px")
    .attr("fill", "black");

// Custom heatmap function for each node
function heatmapIntensity(x, y, node) {
    let dx = x - node.xArea;
    let dy = y - node.yArea;
    let distanceSquared = dx * dx + dy * dy;
    return Math.exp(-distanceSquared / (2 * node.areaRadius * node.areaRadius));
}

// Custom heatmap attraction force for each node
function forceHeatmapAttraction(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            let intensity = heatmapIntensity(d.x, d.y, d);  // Using node's specific area and radius

            // Apply force towards the node's heatmap center
            let dx = d.xArea - d.x;
            let dy = d.yArea - d.y;

            d.vx += dx * intensity * strength * alpha;
            d.vy += dy * intensity * strength * alpha;
        });
    };
}

// Ticked function to update node positions
function ticked() {
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
}

// Drag behavior functions
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