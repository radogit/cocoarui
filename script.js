import * as d3 from "d3";
import { nodes, nodesQueue, flipYCoordinates, fixInitially, collisionMargin } from "./js/data.js";
import { forceGaussianPreferredArea, forceCustomCollision } from "./js/forces.js";
import { createSvgAndContainer, createAxes, createArrowheads } from "./js/drawing.js";
import { createHeatmapGradients, buildHeatspotRects } from "./js/heatmaps.js";
import { setupUI, showForceArrows, showNodeLines, showObservations, showNetForce, showCoordinates, showNodeLabel } from "./js/ui.js";
//import { dragging, dragEnd, dragStart, toggleFixed } from "./js/nodeInteraction.js";
import { setupLogger } from './js/logger.js';

// Set up the logger
setupLogger();

// ========= parameters =========

const colours = ['red', 'green', 'blue', 'orange', 'purple', 'cyan', 'magenta', 'yellow', 'darkblue', 'darkgreen', 'lightblue', 'lightgreen', 'coral', 'gold', 'salmon', 'slateblue', 'teal', 'olive', 'brown', 'darkorange'];

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Flip Y to treat up as positive
flipYCoordinates(nodesQueue);

// 2) Fix initial nodes that are isFixed
fixInitially(nodesQueue);

// 3) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, width, height } = createSvgAndContainer();
const minDim = Math.min(width, height);

// 4) Draw axes
const { xScale, yScale, xAxis, yAxis } = createAxes(container, width, height, minDim);

// 5) Arrowhead artefacts
const defs = svg.append("defs").attr("id","defs");
createArrowheads(svg);

// 6) Create the gradients by calling the new function
createHeatmapGradients(defs, nodes, colours);

// 7) Then build the hotspot rects, also from the new function
buildHeatspotRects(hotspotLayer, nodes);

// 8) UI toggles
setupUI();


// ================================================================================================================
// =============== SPAWN ===============================================================================
// ================================================================================================================

let nodeGroup;

function buildOrUpdateNodes(container, nodes) {
  
    // The key is re-joining with the 'node-group' class
    nodeGroup = container.selectAll(".node-group")
      .data(nodes, d => d.id)      // key by node id
      .join(
        enter => {
          // For newly entered node(s):
          const g = enter.append("g")
            .attr("class", "node-group")
            .on("dblclick", toggleFixed) // so new nodes also get toggleFixed
            .call(d3.drag()
              .on("start", dragStart)
              .on("drag", dragging)
              .on("end", dragEnd)
            );
  
          // append the circle
          g.append("circle")
            .attr("fill", d => d.color)
            .attr("opacity", 0.6)
            .attr("r", d => d.radius)
            .attr("stroke", d => d.isFixed ? "black" : "none")
            .attr("stroke-width", d => d.isFixed ? 3 : 0);
  
          // append ID label
          g.append("text")
            .attr("class", showNodeLabel? "id-label" : "id-label hidden")
            .attr("dx", 0)
            .attr("dy", d => -d.radius - 2)
            .text(d => d.id)
            ;
  
          // append coords label (if you want)
          g.append("text")
            .attr("class", "coord-label")
            .attr("dx", 0)
            .attr("dy", d => d.radius + 15)
            ;

          // Force arrows container
          g.append("g")
            .attr("class", "force-arrows");

          // Node relations container
          g.append("g")
            .attr("class", "node-relations");
            
          // Log the id of each newly spawned node
          g.each(function(d) {
              console.log('spawned: ' + d.id);
          });
          return g;
        },
        update => {
          // If you want to handle updated nodes, set or transition them here
          // e.g., update.attr(...).transition(...) 
          return update;
        },
        exit => exit.remove()
      );
  
    // Optionally, we can set the initial position for all nodes
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
  
    return nodeGroup; // return the selection if you want
  }

// ================================================================================================================
  
// Timed Drip Approach
let i = 0; 
const intervalId = setInterval(() => {
  if (i >= nodesQueue.length) {
    // We have spawned them all
    clearInterval(intervalId);
    return;
  }

  // Take the next node:
  const newNode = nodesQueue[i];
  i++;

  // Add to the simulation array:
  nodes.push(newNode);

  // (A) Re-run hotspot data-join to create rects for newNode.hotspots
  buildHeatspotRects(hotspotLayer, nodes);

  // (B) Re-run node data-join to create circles, labels, etc.
  buildOrUpdateNodes(nodeLayer, nodes);

  // (C) Let the sim see the new array
  simulation.nodes(nodes);
  simulation.alpha(1).restart();
  
}, 1000); // spawn 1 node each second

// ================================================================================================================

function addOne() {
  const newNode = {
    id: "spawn-"+Date.now().toString(36).substring(2, 8),
    x: width * (Math.random() - 0.5),
    y: height * (Math.random() - 0.5),
    color: colours[Math.floor(Math.random() * colours.length)],
    radius: 20+30 * Math.random(),
    isFixed: false,
    significance: 1,
    hotspots: []
  };
  for (let i = 0, iterations = Math.floor(Math.random() * 4) + 1; i < iterations; i++) {
    newNode.hotspots.push(
      { 
        x: (width-200) * (Math.random() - 0.5), 
        y: (height-200) * (Math.random() - 0.5), 
        intensityFactor: 1.0, 
        width: 40+160 * Math.random(), 
        height: 40+160 * Math.random(), 
        forceType: "attract"  
      }
    );
  }
  
  nodes.push(newNode);
  // (A) Re-run hotspot data-join to create rects for newNode.hotspots
  buildHeatspotRects(hotspotLayer, nodes);

  // (B) Re-run node data-join to create circles, labels, etc.
  buildOrUpdateNodes(nodeLayer, nodes);

  // (C) Let the simulation know about new node
  simulation.nodes(nodes);       
  simulation.alpha(1).restart(); 
}

// ================================================================================================================

function removeAllNodes() {
  // 1) Clear the array
  nodes.splice(0, nodes.length);  // or nodes.length = 0

  // 2) Re-run the data join for nodes and hotspots
  buildOrUpdateNodes(nodeLayer, nodes);
  buildHeatspotRects(hotspotLayer, nodes);

  // 3) Notify the simulation we have no nodes
  simulation.nodes(nodes);

  // 4) Optionally reheat the simulation 
  //    (with 0 nodes, there won’t be motion, but it can forcibly update)
  simulation.alpha(1).restart();
}

// Then attach this to a button:
document.getElementById("removeAllButton")
  .addEventListener("click", removeAllNodes);

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
    if (!nodeGroup) return;   // If it's undefined, skip
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Update coordinates label
    if (showCoordinates) {
        nodeGroup.select(".coord-label")
            .text(d => `(${Math.round(d.x/minDim*180)}, ${Math.round(-d.y/minDim*180)})`);
    }
    
    // Clear previous arrows before drawing new ones
    //forceArrows.selectAll(".force-arrow").remove();  
    nodeGroup.selectAll(".force-arrow, .force-arrow-value, .force-arrow-label-group").remove();  
    nodeGroup.selectAll(".node-relation, .node-relation-value, .node-relation-label-group").remove();  

    nodeGroup.select("circle")
        .attr("stroke", d => d.isFixed ? "black" : "none")
        .attr("stroke-width", d => d.isFixed ? 3 : 0);


    // Add arrows and lines based on the calculated forces
    nodeGroup.each(function(d) {
        const arrowGroup = d3.select(this).select(".force-arrows");
        const nodeRelationsGroup = d3.select(this).select(".node-relations");

        d.hotspots.forEach((hotspot, index) => {
            // If toggle is off, no need to draw lines.
            //if (!showNodeLines) return;
            //console.log(hotspot.width);
            nodeRelationsGroup.append("line")
            .attr("class",showNodeLines ? "node-relation" : "node-relation hidden")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (-d.x+hotspot.x))
            .attr("y2", (-d.y+hotspot.y))
            .attr("stroke", d.color)
            .attr("stroke-width", 4)
            .attr("stroke-dasharray", "0,20")
            .attr("stroke-linecap", "round")
            .style("opacity", 0.2);
        });

        // Draw individual force arrows (e.g., from hotspots)
        d.forces.forEach((force, index) => {          

            // If toggle is off, no need to draw arrows.
            //if (!showForceArrows) return;

            const length = Math.min(Math.sqrt(force.fx ** 2 + force.fy ** 2) * 2, 1000);
            const angle = Math.atan2(force.fy, force.fx);
            const labelAngle = ( ((angle + Math.PI / 2)/Math.PI) * 180 ) %180;
            // a little bit of magic to keep labels from ever perfectly overlapping each other
            const labelPosX = (1.0 * length + 35) * Math.cos(angle) + index*2 - d.forces.length/2;
            const labelPosY = (1.0 * length + 35) * Math.sin(angle) + index*2 - d.forces.length/2;

            // 1) The arrow line
            arrowGroup.append("line")
                //.attr("class", "force-arrow")
                .attr("class", force.source.includes("collision") ? 
                  (showForceArrows ? "force-arrow force-arrow-orange" : "force-arrow force-arrow-orange hidden") 
                  : 
                  (showForceArrows ? "force-arrow force-arrow-white" : "force-arrow force-arrow-white hidden")
                )
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", length * Math.cos(angle))
                .attr("y2", length * Math.sin(angle))
                .attr("stroke", force.source.includes("collision") ? "orange" : "white")
                .attr("stroke-width", 5)
                .attr("marker-end", "url(#arrowhead-"+(force.source.includes("collision") ? "orange" : "white")+")")
                .style("opacity", 0.5);
            // 2) The arrow magnitude text
            // Append a group to hold the label & background
            const labelGroup = arrowGroup.append("g")
                .attr("class", showForceArrows? "force-arrow-label-group" : "force-arrow-label-group hidden")
                .attr("transform", `translate(${labelPosX},${labelPosY})`)
                .attr("opacity", 0.3)
                ;
            const bgRect = labelGroup.append("rect")
                .attr("class", "force-arrow-label-bg")
                .attr("x", -20) // we’ll adjust this once we know the text width
                .attr("y", -10)
                .attr("width", 40) // default guess
                .attr("height", 20)
                .attr("rx", 4) // rounded corners
                .attr("fill", "rgba(0,0,0)")
                .attr("transform", `rotate(${labelAngle})`)
                ; // a semi-transparent black background
            const labelText = labelGroup.append("text")
                .attr("class", "force-arrow-label-text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "white")
                .attr("font-size", 12)
                // Round magnitude to 2 decimals
                .text(length.toFixed(0) + ' ∠' + labelAngle.toFixed(0) + '°')
                .attr("transform", `rotate(${labelAngle})`)
                ;
            const bbox = labelText.node().getBBox(); 
            // e.g. { x, y, width, height } of the text

            bgRect
              .attr("x", bbox.x - 4)
              .attr("y", bbox.y - 2)
              .attr("width", bbox.width + 8)
              .attr("height", bbox.height + 4);

            // arrowGroup.append("text")
            //   .attr("class", "force-arrow-value")
            //   // Position the text at, say, 60% along the arrow
            //   .attr("x", 0.6 * length * Math.cos(angle) + 10 * Math.cos(labelAngle))
            //   .attr("y", 0.6 * length * Math.sin(angle) + 10 * Math.sin(labelAngle))
            //   .attr("fill", force.source.includes("collision") ? "orange" : "white")
            //   .attr("font-size", "10px")
            //   .attr("text-anchor", "middle")
            //   // Round the magnitude to 2 decimals (or 1)
            //   .text( (Math.sqrt(force.fx ** 2 + force.fy ** 2)).toFixed(0) );                
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
                    .attr("class", (showNetForce) ? "force-arrow net-force-arrow" : "force-arrow net-force-arrow hidden")
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

document.getElementById("spawnOneButton").addEventListener("click", addOne);
document.getElementById("removeAllButton").addEventListener("click", removeAllNodes());

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
    //redrawAxes(); // if you have an axis you want to keep consistent
}