const width = 800, height = 600;

const nodes = [
    { id: "A", x: 550, y: 550, xArea: 200, yArea: 300, radius: 30, areaRadius: 100 },
    { id: "B", xArea: 500, yArea: 300, radius: 40, areaRadius: 150 }
];

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const simulation = d3.forceSimulation(nodes)
    //.force("preferredArea", forcePreferredArea(0.1)) // Custom force
    .force("repel", d3.forceManyBody().strength(-50)) // Mild repulsion
    .force("collide", d3.forceCollide().radius(d => d.radius + 5)) // Prevent overlap
    .force("gaussian", forceGaussianPreferredArea(1.5)) // Our new Gaussian force
    .on("tick", ticked);




        
const defs = svg.append("defs");

const gradient = defs.append("radialGradient")
    .attr("id", "forceGradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");
        
gradient.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "blue")
    .style("stop-opacity", 0.4);
        
gradient.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "white")
    .style("stop-opacity", 0);
        
const areaCircles = svg.selectAll(".area")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", "area")
    .attr("cx", d => d.xArea)
    .attr("cy", d => d.yArea)
    .attr("r", d => d.areaRadius)
    .style("fill", "url(#forceGradient)")
    .style("opacity", 1)
    .lower();  // <------ This ensures they are sent to the back!
        
// const node = svg.selectAll(".node")
//     .data(nodes)
//     .enter()
//     .append("g") // Group elements together
//     .append("circle")
//     .attr("class", "node-circle")
//     .attr("r", d => d.radius)
//     .attr("fill", (d, i) => i === 0 ? "red" : "blue")
//     .call(d3.drag()
//         .on("start", dragStart)
//         .on("drag", dragging)
//         .on("end", dragEnd));

// Create a group (`<g>`) for each node
const nodeGroup = svg.selectAll(".node-group")
    .data(nodes)
    .enter()
    .append("g") // Group elements together
    .attr("class", "node-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`) // Positioning
    .call(d3.drag()
        .on("start", dragStart)
        .on("drag", dragging)
        .on("end", dragEnd)
        );

// Append circles inside the group
nodeGroup.append("circle")
    .attr("fill", (d, i) => i === 0 ? "red" : "blue")
    .attr("r", d => d.radius);

// Append labels inside the group
nodeGroup.append("text")
    .attr("dx", 0)  // Offset to the right of the circle
    .attr("dy", d => -d.radius-2)   // Slightly below center
    .attr("text-anchor", "middle")
    .text(d => d.id)
    .attr("font-size", "12px")
    .attr("fill", "black");


// ========================================================================================================================


// Custom force function
function forcePreferredArea(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            const dx = d.x - d.xArea;
            const dy = d.y - d.yArea;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > d.areaRadius) {
                // Calculate the push-back force to return the node
                const force = (distance - d.areaRadius) * strength;
                d.vx -= (dx / distance) * force * alpha;
                d.vy -= (dy / distance) * force * alpha;
            }
        });
    };
}

// Update node positions
function ticked() {
    //node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    areaCircles
        .attr("cx", d => d.xArea)
        .attr("cy", d => d.yArea);

    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
}

// function ticked() {
//     node.attr("cx", d => d.x)
//         .attr("cy", d => d.y);
// }

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

function forceGaussianPreferredArea(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            const dx = d.x - d.xArea;
            const dy = d.y - d.yArea;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {  // Avoid division by zero
                const force = Math.exp(-distance / d.areaRadius) * strength; // Gaussian decay
                d.vx -= dx * force * alpha;
                d.vy -= dy * force * alpha;
            }
        });
    };
}

function forceInversePreferredArea(strength) {
    return function (alpha) {
        nodes.forEach(d => {
            const dx = d.x - d.xArea;
            const dy = d.y - d.yArea;
            const distance = Math.sqrt(dx * dx + dy * dy) + 1; // Avoid division by zero

            const force = (strength / distance) * alpha; // Inverse attraction
            d.vx -= dx * force;
            d.vy -= dy * force;
        });
    };
}

// svg.append("circle")
//     .attr("cx", 300)
//     .attr("cy", 300)
//     .attr("r", 100)
//     .style("fill", "blue")
//     .style("opacity", 0.2); // Light heatmap effect

// const areaCircles = svg.selectAll(".area")
//     .data(nodes)
//     .enter()
//     .append("circle")
//     .attr("class", "area")
//     .attr("cx", d => d.xArea)
//     .attr("cy", d => d.yArea)
//     .attr("r", d => d.areaRadius) // Show the force field radius
//     .style("fill", "blue")
//     .style("opacity", 0.2); // Light transparency
    
