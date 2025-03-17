export function addNewNode() {
    console.log('spawning!');
    
    // 1) The new node data
    const newNode = {
        id: "F",
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: "pink",
        radius: 20,
        isFixed: false,
        significance: 10,
        hotspots: []
    };

    // 2) Insert into the simulation
    const oldNodes = simulation.nodes();
    const newNodes = [...oldNodes, newNode];
    simulation.nodes(newNodes);

    // 3) Re-bind to DOM
    const nodeGroup = container.selectAll(".node-group")
        .data(newNodes, d => d.id)
        .join(
        enter => {
            const g = enter.append("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", dragStart)
                .on("drag", dragging)
                .on("end", dragEnd)
            );

            g.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            // ...
            
            // ID label, coord label, etc., if you want
            // ...
            return g;
        },
        update => update,
        exit => exit.remove()
        );

    // 4) Re-heat
    simulation.alpha(1).restart();
}