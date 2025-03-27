import * as d3 from "d3";
import * as Datasets from "./js/datasets.js";
import * as Forces from "./js/forces.js";
import * as Drawing from "./js/drawing.js";
import * as Heatmaps from "./js/heatmaps.js";
import * as AppUI from "./js/ui.js";
import * as Backgrounds from "./js/backgrounds.js";
//import { dragging, dragEnd, dragStart, toggleFixed } from "./js/nodeInteraction.js";
import { setupLogger } from './js/logger.js';
//import { dripSpawnNodes } from "./js/dripSpawnNodes.js";

// Set up the logger
setupLogger();

// ========= parameters =========

const colours = ['red', 'green', 'blue', 'orange', 'purple', 'cyan', 'magenta', 'yellow', 'darkblue', 'darkgreen', 'lightblue', 'lightgreen', 'coral', 'gold', 'salmon', 'slateblue', 'teal', 'olive', 'brown', 'darkorange'];

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();

// 2) Draw axes
const { xScale, yScale, xAxis, yAxis } = Drawing.createAxes(container, width, height, minDim);

// 3) Arrowhead artefacts
const defs = svg.append("defs").attr("id","defs").attr("width",100).attr("height",100);
Drawing.createArrowheads(svg);

// 3+) Backgrounds
//Backgrounds.createBackgroundDefs(defs, scaleUnit);

// 4) Create the gradients by calling the new function
Heatmaps.createHeatmapGradients(defs, Datasets.nodes, colours);

// 5) Then build the hotspot rects, also from the new function
Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes);

// 6) Set up UI toggles
AppUI.setupUI();


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
            .attr("class", AppUI.showNodeLabel.boolState? AppUI.showNodeLabel.DOMObjectString : AppUI.showNodeLabel.DOMObjectString + " hidden")
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

// ====== ADD ONE ==========================================================================================================

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
  
  Datasets.nodes.push(newNode);
  // (A) Re-run hotspot data-join to create rects for newNode.hotspots
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes);

  // (B) Re-run node data-join to create circles, labels, etc.
  buildOrUpdateNodes(nodeLayer, Datasets.nodes);

  // (C) Let the simulation know about new node
  simulation.nodes(Datasets.nodes);       
  simulation.alpha(1).restart(); 
}


// ======= DRIP =========================================================================================================
let nodesQueue = [];

// Then define a function to handle a button click or something:
function spawnOneByOne(someDataArray) {
  console.log('spawning set: ', "green");
  // 1) Clear the array
  nodesQueue.splice(0, nodesQueue.length);

  // 2) put the items from someDataArray to the queue
  nodesQueue = structuredClone(someDataArray);

  // 3) Flip Y to treat up as positive
  Datasets.flipYCoordinates(nodesQueue);

  // 4) Fix initial nodes that are isFixed
  Datasets.fixInitially(nodesQueue);

  // 5) let it drip 
  dripSpawnNodes(
    nodesQueue,
    Datasets.nodes,
    hotspotLayer,
    nodeLayer,
    simulation,
    1000 // 1 second between spawns
  );
}

/**
 * Timed "drip" approach to spawn nodes from a queue one at a time.
 * @param {Array} nodesQueue     The array of node data to spawn over time.
 * @param {Array} nodes          The main node array in the simulation.
 * @param {d3.Selection} hotspotLayer The <g> container for hotspot rects.
 * @param {d3.Selection} nodeLayer    The <g> container for node groups.
 * @param {d3.Simulation} simulation  The d3 force simulation.
 * @param {number} intervalMs    How many milliseconds between spawns, default 1000.
 */
export function dripSpawnNodes(
  nodesQueue,
  nodes,
  hotspotLayer,
  nodeLayer,
  simulation,
  intervalMs = 1000
) {
  let i = 0; 
  const intervalId = setInterval(() => {
    if (i >= nodesQueue.length) {
      clearInterval(intervalId);
      return;
    }

    // Take the next node from the queue
    const newNode = nodesQueue[i];
    i++;
    newNode.id = newNode.id + '-' + Date.now().toString(36).substring(2, 8);

    // Add to the main node array
    nodes.push(newNode);

    // Re-run the hotspot data-join so new hotspots appear
    Heatmaps.buildHeatspotRects(hotspotLayer, nodes);

    // Re-run the node data-join so new node circles/labels appear
    buildOrUpdateNodes(nodeLayer, nodes);

    // Let the simulation know about the new array
    simulation.nodes(nodes);
    simulation.alpha(1).restart();

  }, intervalMs);
}

// ======== REMOVE ========================================================================================================

function removeAllNodes() {
  // 1) Clear the array
  Datasets.nodes.splice(0, Datasets.nodes.length);

  // 2) Re-run the data join for nodes and hotspots
  buildOrUpdateNodes(nodeLayer, Datasets.nodes);
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes);

  // 3) Notify the simulation we have no nodes
  simulation.nodes(Datasets.nodes);

  // 4) Optionally reheat the simulation 
  //    (with 0 nodes, there won’t be motion, but it can forcibly update)
  simulation.alpha(1).restart();
}

// ================================================================================================================
// =============== SIMULATION LOGIC =======================================================================================
// ================================================================================================================

const simulation = d3.forceSimulation(Datasets.nodes)
    .force("repel", d3.forceManyBody().strength(d => d.isFixed ? 0 : -50)) // Mild repulsion
    .force("collide", d3.forceCollide().radius(d => d.radius + Datasets.collisionMargin).strength(1.2)) // Prevent overlap
    .force("gaussian", Forces.forceGaussianPreferredArea(1.5)) // Gaussian force for hotspots
    .force("customCollision", Forces.forceCustomCollision) // New collision force
    .on("tick", ticked);


function ticked() {
    if (!nodeGroup) return;   // If it's undefined, skip
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Update coordinates label
    if (AppUI.showCoordinates.boolState) {
        nodeGroup.select("."+AppUI.showCoordinates.DOMObjectString)
            .text(d => `(${Math.round(d.x * scaleUnit)}, ${Math.round(-d.y * scaleUnit)})`);
    }
    
    // Clear previous arrows before drawing new ones
    nodeGroup.selectAll("."+AppUI.showForceArrows.DOMObjectSingleString+", ."+AppUI.showForceArrows.DOMObjectSingleString+"-value, ."+AppUI.showForceArrows.DOMObjectSingleString+"-label-group").remove();  
    nodeGroup.selectAll("."+AppUI.showNodeLines.DOMObjectSingleString+", ."+AppUI.showNodeLines.DOMObjectSingleString+"-value, ."+AppUI.showNodeLines.DOMObjectSingleString+"-label-group").remove();  

    nodeGroup.select("circle")
        .attr("stroke", d => d.isFixed ? "black" : "none")
        .attr("stroke-width", d => d.isFixed ? 3 : 0);


    // Add arrows and lines based on the calculated forces
    nodeGroup.each(function(d) {
        const arrowGroup = d3.select(this).select("."+AppUI.showForceArrows.DOMObjectString);
        const nodeRelationsGroup = d3.select(this).select("."+AppUI.showNodeLines.DOMObjectString);

        d.hotspots.forEach((hotspot, index) => {
            nodeRelationsGroup.append("line")
            .attr("class",AppUI.showNodeLines.boolState ? AppUI.showNodeLines.DOMObjectSingleString : AppUI.showNodeLines.DOMObjectSingleString+" hidden")
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
            //if (!AppUI.showForceArrows) return;

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
                  (AppUI.showForceArrows.boolState ? AppUI.showForceArrows.DOMObjectSingleString+" "+AppUI.showForceArrows.DOMObjectSingleString+"-orange" : AppUI.showForceArrows.DOMObjectSingleString+" "+AppUI.showForceArrows.DOMObjectSingleString+"-orange hidden") 
                  : 
                  (AppUI.showForceArrows.boolState ? AppUI.showForceArrows.DOMObjectSingleString+" "+AppUI.showForceArrows.DOMObjectSingleString+"-white" : AppUI.showForceArrows.DOMObjectSingleString+" "+AppUI.showForceArrows.DOMObjectSingleString+"-white hidden")
                )
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", length * Math.cos(angle))
                .attr("y2", length * Math.sin(angle))
                .attr("stroke", force.source.includes("collision") ? "orange" : "white")
                .attr("stroke-width", 5)
                .attr("marker-end", "url(#arrowhead-"+(force.source.includes("collision") ? "orange" : "white")+")")
                .style("opacity", 0.5);
            // 2) The arrow magnitude text, Append a group to hold the label & background
            const labelGroup = arrowGroup.append("g")
                .attr("class", AppUI.showForceArrows.boolState? AppUI.showForceArrows.DOMObjectSingleString+"-label-group" : AppUI.showForceArrows.DOMObjectSingleString+"-label-group hidden")
                .attr("transform", `translate(${labelPosX},${labelPosY})`)
                .attr("opacity", 0.3)
                ;
            const bgRect = labelGroup.append("rect")
                .attr("class", AppUI.showForceArrows.DOMObjectSingleString+"-label-bg")
                .attr("x", -20) // we’ll adjust this once we know the text width
                .attr("y", -10)
                .attr("width", 40) // default guess
                .attr("height", 20)
                .attr("rx", 4) // rounded corners
                .attr("fill", "rgba(0,0,0)")
                .attr("transform", `rotate(${labelAngle>90? labelAngle-180 : labelAngle})`)
                ; // a semi-transparent black background
            const labelText = labelGroup.append("text")
                .attr("class", AppUI.showForceArrows.DOMObjectSingleString+"-label-text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "white")
                .attr("font-size", 12)
                .text(length.toFixed(0) + ' ∠' + labelAngle.toFixed(0) + '°')
                .attr("transform", `rotate(${labelAngle>90? labelAngle-180 : labelAngle})`) 
                ;
            const bbox = labelText.node().getBBox();  // e.g. { x, y, width, height } of the text

            bgRect
              .attr("x", bbox.x - 4)
              .attr("y", bbox.y - 2)
              .attr("width", bbox.width + 8)
              .attr("height", bbox.height + 4);
        });

        if (AppUI.showNetForce.boolState) {
            const netForceX = d.vx;
            const netForceY = d.vy;
            const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

            if (netForceMagnitude > 0.1) {
                const netLength = Math.min(netForceMagnitude * 5, 1000);
                const netAngle = Math.atan2(netForceY, netForceX);

                arrowGroup.append("line")
                    .attr("class", (AppUI.showNetForce.boolState) ? AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow hidden")
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
document.getElementById("removeAllButton").addEventListener("click", removeAllNodes);

const spawnButtonContainer = document.getElementById("spawnButtonContainer");

if(spawnButtonContainer){
  Datasets.preppedNodes.forEach(({name, nodes}) => {
    const spawnButton = document.createElement('button');
    spawnButton.textContent = 'Set \'' + name + '\'';
    spawnButton.id = 'spawnButton-'+name;
    spawnButton.addEventListener("click", () => {
      spawnOneByOne(nodes);
    });
    spawnButtonContainer.append(spawnButton);
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
    //redrawAxes(); // if you have an axis you want to keep consistent
}

// ======== Keyboard ==================================================

addEventListener('keydown', function(event) {
  let inputs = document.getElementById("UIContainer").getElementsByTagName("input");
  if (event.code.startsWith('Digit')) {
    const index = parseInt(event.code.replace('Digit', ''), 10)-1;
    if (inputs[index]) {
      inputs[index].click();
    }
    return;
  } 
  switch (event.code) {
    case "Backquote":
      document.getElementById("spawnOneButton").click();
      break;
    case "Backspace":
      document.getElementById("removeAllButton").click();
      break;
  }
});