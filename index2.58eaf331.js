const width = 800, height = 600;
const nodes = [
    {
        id: "A",
        xArea: 200,
        yArea: 300,
        radius: 30
    },
    {
        id: "B",
        xArea: 500,
        yArea: 300,
        radius: 40
    }
];
const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const simulation = d3.forceSimulation(nodes).force("x", d3.forceX((d)=>d.xArea).strength(0.1)) // Pull toward assigned x-area
.force("y", d3.forceY((d)=>d.yArea).strength(0.1)) // Pull toward assigned y-area
.force("repel", d3.forceManyBody().strength(-50)) // Mild repulsion
.force("collide", d3.forceCollide().radius((d)=>d.radius + 5)) // Prevent overlap
.on("tick", ticked);
const node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("r", (d)=>d.radius).attr("fill", (d, i)=>i === 0 ? "red" : "blue").call(d3.drag().on("start", dragStart).on("drag", dragging).on("end", dragEnd));
function ticked() {
    node.attr("cx", (d)=>d.x).attr("cy", (d)=>d.y);
}
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

//# sourceMappingURL=index2.58eaf331.js.map
