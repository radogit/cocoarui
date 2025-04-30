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
//import { addNodeWithMultistartVisual } from './js/spawnHelpers.js';

// Set up the logger
setupLogger();

// ========= parameters =========

const colours = ['red', 'green', 'blue', 'orange', 'purple', 'cyan', 'magenta', 'yellow', 'darkblue', 'darkgreen', 'lightblue', 'lightgreen', 'coral', 'gold', 'salmon', 'slateblue', 'teal', 'olive', 'brown', 'darkorange'];

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, windLayerCancel, windLayerStress, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();

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
Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

// 6) Set up UI toggles
AppUI.setupUI();


// ================================================================================================================
// =============== SPAWN ===============================================================================
// ================================================================================================================

let nodeGroup;

function buildOrUpdateNodes(container, nodes) {
  
    nodeGroup = container.selectAll(".node-group")
      .data(nodes, d => d.id)      // key by node id
      .join(
        enter => {
          // For newly entered node(s):
          const g = enter.append("g")
            .attr("class", "node-group")
            .on("dblclick", toggleFixed)
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
            .attr("stroke-width", d => d.isFixed ? 3 : 0)
            .on("mouseover", function(event, d) {
              let elementId = "spawn-cand-stress-" + d.id;
              let targetElement = document.getElementById(elementId);
              if (targetElement) {
                  targetElement.setAttribute("opacity", 1);
              }
              elementId = "spawn-cand-cancel-" + d.id;
              targetElement = document.getElementById(elementId);
              if (targetElement) {
                  targetElement.setAttribute("opacity", 1);
              }
            })
            .on("mouseout", function(event, d) {
                let elementId = "spawn-cand-stress-" + d.id;
                let targetElement = document.getElementById(elementId);
                if (targetElement) {
                    targetElement.setAttribute("opacity", "0.2");
                }
                elementId = "spawn-cand-cancel-" + d.id;
                targetElement = document.getElementById(elementId);
                if (targetElement) {
                    targetElement.setAttribute("opacity", "0.2");
                }
            });
    
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
              //console.log('spawned: ' + d.id);
          });
          return g;
        },
        update => {
          // If you want to handle updated nodes, set or transition them here
          // e.g., update.attr(...).transition(...) 
          return update;
        },
        exit => {
          exit.remove();
        }
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
    hotspots: randomHotspots(1+Math.floor(Math.random()*4))
  };
  
  Datasets.nodes.push(newNode);
  // (A) Re-run hotspot data-join to create rects for newNode.hotspots
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

  // (B) Re-run node data-join to create circles, labels, etc.
  buildOrUpdateNodes(nodeLayer, Datasets.nodes);

  // (C) Let the simulation know about new node
  simulation.nodes(Datasets.nodes);       
  simulation.alpha(1).restart(); 
}

function randomHotspots(n=1){
  const arr = [];
  for (let i = 0; i < n; i++){
    arr.push({
      x : (width  - 200) * (Math.random() - 0.5),
      y : (height - 200) * (Math.random() - 0.5),
      intensityFactor : 1.0,
      width  : 40 + 160 * Math.random(),
      height : 40 + 160 * Math.random(),
      forceType : "attract"
    });
  }
  return arr;
}

// async function addOneSmart(){
//   const template = {
//     id: "spawn-" + Date.now().toString(36).slice(-4),
//     color: colours[Math.floor(Math.random()*colours.length)],
//     radius: 25,
//     isFixed:false,
//     significance:1,
//     hotspots: randomHotspots( Math.floor(Math.random()*4)+1 )
//   };

  
//   await addNodeWithMultistart(
//         Datasets.nodes, template, simulation, defs, width, height,
//         36,          // k = 6 random starts
//         30);        // 30 mini-ticks each

//   // redraw DOM
//   Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);
//   buildOrUpdateNodes(nodeLayer,      Datasets.nodes);
//   //simulation.nodes(Datasets.nodes).alpha(1).restart();
//   simulation.alpha(1).restart();
// }


// document.getElementById("addOneSmartVisButton").onclick = async () => {
//   const tmpl = {
//     id  : "spawn-" + Date.now().toString(36).slice(-4),
//     color: colours[ Math.floor(Math.random()*colours.length) ],
//     radius: 25,
//     isFixed:false,
//     significance:1,
//     hotspots: randomHotspots(1+Math.floor(Math.random()*4))
//   };

//   await addNodeWithMultistartVisual(
//       Datasets.nodes, tmpl, simulation,
//       nodeLayer, hotspotLayer, defs, width, height,
//       36,   // k trials
//       30);  // ticks each
// };

async function addOneSmart(){
  const template = {
    id   : "spawn-"+Date.now().toString(36).slice(-4),
    color: colours[Math.floor(Math.random()*colours.length)],
    radius: 25,
    isFixed:false,
    significance:1,
    hotspots: randomHotspots(Math.floor(Math.random()*4)+2)
  };

  await addNodeWithMultistartVisual(
      Datasets.nodes,
      template,          // the node blueprint
      simulation,
      width, height, defs,
      windLayerCancel,windLayerStress,
      /* ticks   */ 1,
      /* cols    */ 20,
      /* rows    */ 10,
      /* jitter? */ false
  );
  // redraw DOM
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);
  buildOrUpdateNodes(nodeLayer,      Datasets.nodes);
  //simulation.nodes(Datasets.nodes).alpha(1).restart();
  simulation.alpha(1).restart();
}

/**
 * Try every point of a grid, keep the location with the highest
 * “cancellation” score  (  Σ|Fi| − |ΣFi|  ).
 * A small marker + label is left in windLayerCancel for every trial.
 *
 * @param {Array} nodes          main data array (is mutated)
 * @param {Object} template      blueprint of the new node (is cloned)
 * @param {d3.Simulation} simulation  your running force simulation
 * @param {Number} width,height  current canvas extent
 * @param {d3.Selection} defs    <defs> where gradients live
 * @param {d3.Selection} windLayerCancel  <g> used for debug crumbs
 * @param {d3.Selection} windLayerStress  <g> used for debug crumbs
 * @param {Number} ticks         mini–ticks per candidate   (default 30)
 * @param {Number} gridCols      lattice columns            (default 5)
 * @param {Number} gridRows      lattice rows               (default 5)
 * @param {Boolean} jitter       true → random offset inside each cell
 */
export async function addNodeWithMultistartVisual(
  nodes, template, simulation,
  width, height, defs, windLayerCancel, windLayerStress,
  ticks      = 30,
  gridCols   = 5,
  gridRows   = 5,
  jitter     = false
){
  let bestStress = -Infinity;      // we *maximise* the cancellation score
  let bestClone  = null;

  // ───────────────────────────────────────────────────────────── grid loop
  const dx = width  / gridCols;
  const dy = height / gridRows;
  let trial = 0;
  const gCancel = windLayerCancel.append("g")
    .attr("id","spawn-cand-cancel-"+template.id)
    .attr("class", AppUI.showWindCancel.boolState? AppUI.showWindCancel.DOMObjectString : AppUI.showWindCancel.DOMObjectString + " hidden")
    .attr("opacity","0.2")
    ;
  const gStress = windLayerStress.append("g")
    .attr("id","spawn-cand-stress-"+template.id)
    .attr("class", AppUI.showWindStress.boolState? AppUI.showWindStress.DOMObjectString : AppUI.showWindStress.DOMObjectString + " hidden")
    .attr("opacity","0.2")
    ;

  for (let gy = 0; gy < gridRows; gy++){
    for (let gx = 0; gx < gridCols; gx++){

      // centre of the current grid cell (0,0) in canvas centre
      let cx = (gx + 0.5) * dx - width  / 2;
      let cy = (gy + 0.5) * dy - height / 2;
      if (jitter){
        cx += (Math.random()-0.5)*dx*0.8;
        cy += (Math.random()-0.5)*dy*0.8;
      }

      // 1 ‧ clone template & position ---------------------------------------
      const cand = structuredClone(template);
      cand.x = cx;
      cand.y = cy;
      cand.id += `-g${gx}-${gy}`;

      // 2 ‧ ensure gradients -------------------------------------------------
      cand.hotspots.forEach(h=>Heatmaps.ensureColourGradient(defs,cand.color));

      // 3 ‧ push ghost & run a few ticks ------------------------------------
      nodes.push(cand);
      buildOrUpdateNodes(nodeLayer, nodes);
      simulation.nodes(nodes);
      for (let t=0; t<ticks; t++) simulation.tick();
      
      // 4 ‧ cancellation score  Σ|Fi| − |ΣFi| ------------------------------
      const stress = cand.forces.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0); // old metric
      const totMag = cand.forces.reduce((s,f)=>s+Math.hypot(f.fx,f.fy),0);
      const sx     = cand.forces.reduce((s,f)=>s+f.fx,0);
      const sy     = cand.forces.reduce((s,f)=>s+f.fy,0);
      const netMag = Math.hypot(sx,sy);
      const cancel = totMag - netMag;

      // 5 ‧ breadcrumb ------------------------------------------------------
      const trialGCancel = gCancel.append("g")
        .attr("transform",`translate(${cand.x},${cand.y})`);
      const trialGStress = gStress.append("g")
        .attr("transform",`translate(${cand.x},${cand.y})`);

      trialGCancel.append("circle")
        .attr("cancel",cancel)
        .attr("r",cancel)
        .attr("fill",cand.color).attr("fill-opacity",.125)
        //.attr("stroke","#000").attr("stroke-width",0.5)
        ;
      
        // trialGStress.append("rect")
        // .attr("width",stress/10)
        // .attr("height",stress/10)
        // .attr("x",-stress/10/2)
        // .attr("y",-stress/10/2)
        // .attr("fill",cand.color).attr("fill-opacity",0.125)
        // //.attr("stroke",cand.color).attr("stroke-width",1)
        // ;
        trialGStress.append("rect")
        .attr("stress",stress)
        .attr("width",dx)
        .attr("height",dy)
        .attr("x",-dx/2)
        .attr("y",-dy/2)
        .attr("fill",cand.color).attr("fill-opacity",0.125*stress/10)
        //.attr("stroke",cand.color).attr("stroke-width",1)
        ;

      const netForceX = cand.vx;
      const netForceY = cand.vy;
      const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

      if (netForceMagnitude > 0.1) {
        const netLength = Math.min(netForceMagnitude * 5, 1000);
        const netAngle = Math.atan2(netForceY, netForceX);

        trialGCancel.append("line")
            //.attr("class", (AppUI.showNetForce.boolState) ? AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow hidden")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", netLength * Math.cos(netAngle))
            .attr("y2", netLength * Math.sin(netAngle))
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead)")
            .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);
      }


      // const gText = trialGCancel.append("text")
      //   .attr("class","id-label")
      //   .attr("x",0).attr("dy","20px").style("opacity",0);
      //   gText.append("tspan").text(`t${trial++}`).attr("dy","-1.2em");
      const gTextCancel = trialGCancel.append("text")
        .attr("class", AppUI.showNodeLabel.boolState? AppUI.showNodeLabel.DOMObjectString : AppUI.showNodeLabel.DOMObjectString + " hidden")
        .attr("x",0).attr("dy","20px");
        gTextCancel.append("tspan").text(`C=${cancel.toFixed(1)}`).attr("dy","0em");
      const gTextStress = trialGStress.append("text")
        .attr("class", AppUI.showNodeLabel.boolState? AppUI.showNodeLabel.DOMObjectString : AppUI.showNodeLabel.DOMObjectString + " hidden")
        .attr("x",0).attr("dy","20px");
        gTextStress.append("tspan").text(`S=${stress.toFixed(1)}`).attr("dy","1.2em");


      // 6 ‧ keep best --------------------------------------------------------
      if (cancel > bestStress){
        bestStress = cancel;
        bestClone  = structuredClone(cand);
      }

      // 7 ‧ pop ghost -------------------------------------------------------
      nodes.pop();
      nodeLayer.selectAll(".node-group")
        .filter(d=>d.id===cand.id)
        .remove();
    }
  }

  // adjust the sizes and opacities of circles, rectangles and lines
  console.log("bestStress " + bestStress);
  console.log(document.getElementById("spawn-cand-cancel-"+template.id).childNodes.length);
   
  // 8 ‧ commit winner -------------------------------------------------------
  bestClone.id = template.id;
  nodes.push(bestClone);
  buildOrUpdateNodes(nodeLayer, nodes);
  simulation.nodes(nodes).alpha(1).restart();
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
    Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);

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

  // clear the wind-force groups
  document.getElementById('wind-layer-stress').innerHTML='';
  document.getElementById('wind-layer-cancel').innerHTML='';

  // 2) Re-run the data join for nodes and hotspots
  buildOrUpdateNodes(nodeLayer, Datasets.nodes);
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

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
document.getElementById("addOneSmartButton").onclick = addOneSmart; 

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
    let index = parseInt(event.code.replace('Digit', ''), 10)-1;
    if(index==-1){index=9;} // fix for Digit0
    if (inputs[index]) {
      inputs[index].click();
    }
    return;
  } 
  switch (event.code) {
    case "Backquote":
      //document.getElementById("spawnOneButton").click();
      document.getElementById("addOneSmartButton").click();
      break;
    case "Backspace":
      document.getElementById("removeAllButton").click();
      break;
  }
});