//import * as d3 from "d3";

const canvasMargin = 200;
const width = window.innerWidth - canvasMargin;
const height = window.innerHeight - canvasMargin;

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    
// Define nodes
const nodes = [
    { id: "movingNode", x: width / 2, y: height / 2, radius: 10, movable: true }, // Draggable node
    { id: "fixedNode1", x: canvasMargin, y: canvasMargin, radius: 10 },
    { id: "fixedNode2", x: canvasMargin+(width - canvasMargin), y: canvasMargin, radius: 10 },
    { id: "fixedNode3", x: canvasMargin+(width - canvasMargin), y: (height - canvasMargin), radius: 10 },
    { id: "fixedNode4", x: canvasMargin, y: (height - canvasMargin), radius: 10 }
];

// Define links
const links = nodes.slice(1).map(fixedNode => ({
    source: "movingNode",
    target: fixedNode.id
}));

// Create the force simulation
const simulation = d3.forceSimulation(nodes)
//    .force("link", d3.forceLink(links).id(d => d.id).distance(550))
    .force("charge", d3.forceManyBody().strength(50)) // Keep forces mild
//    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(12));

// Create links (edges)
const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", "black");

// Create nodes
const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", d => d.radius)
    .attr("fill", d => d.id === "movingNode" ? "red" : "blue")
    .call(d => {
        d.filter(n => n.movable)  // Apply drag only to movingNode
         .call(d3.drag()
             .on("start", dragstart)
             .on("drag", dragged)
             .on("end", dragend));
    });

// Append text labels for each node
const labels = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("text-anchor", "middle")
    .attr("dy", -15) // Position above the node
    .attr("font-size", "12px")
    .attr("fill", "black")
    .attr("class", "label")
    .text(d => d.id); // Use the node ID as the label

// Lock fixed nodes in place
nodes.forEach(d => {
    if (!d.movable) {
        d.fx = d.x;
        d.fy = d.y;
    }
});

function dragstart(event, d) {
    if (!d.movable) return;
    console.log("Drag Start:", d.id);
    simulation.alphaTarget(0.3).restart();
    d.fx = event.x;
    d.fy = event.y;
}

function dragged(event, d) {
    if (!d.movable) return;
    console.log("Dragging:", event.x, event.y);
    d.fx = event.x;
    d.fy = event.y;
}

function dragend(event, d) {
    if (!d.movable) return;
    console.log("Drag End:", d.id);
    simulation.alphaTarget(0);
    d.fx = null; // Let forces take over
    d.fy = null;
}


// Update simulation on tick
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);


    labels // Update label positions
        .attr("x", d => d.x)
        .attr("y", d => d.y);
});
