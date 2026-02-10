import * as d3 from "d3";
import * as Datasets from "./js/datasets.js";
import * as DatasetsVR1 from "./personal/datasetsVR1.js";
import * as DatasetsVR2 from "./personal/datasetsVR2.js";
import * as DatasetsVR3 from "./personal/datasetsVR3.js";
import * as DatasetsVR4 from "./personal/datasetsVR4.js";
import * as DatasetsPPD from "./personal/datasetsPPD.js";
import * as DatasetsPPA from "./personal/datasetsPPA.js";
import * as Forces from "./js/forces.js";
import * as Drawing from "./js/drawing.js";
import * as Heatmaps from "./js/heatmaps.js";
import * as AppUI from "./js/ui.js";
import * as Icons from "./js/icons.js";
//import { dragging, dragEnd, dragStart, toggleFixed } from "./js/nodeInteraction.js";
import { setupLogger } from './js/logger.js';
import * as Exporter from './js/exporter.js';
import { imagePaths, backgroundPresets } from './js/backgrounds.js';
import { spawnPresets, getNodesForPreset } from './js/spawnPresets.js';


window.Datasets = Datasets;   // <-- makes Datasets visible in DevTools

// Global-ish setting for sequence behaviour in dripSpawnSmart
// "fixing" → fix node after it settles; "floating" → leave free.
let sequenceMode = "fixing";

// Set up the logger
setupLogger();

// ========= parameters =========

const colours = [
  'red', 
  'green', 
  'blue', 
  'orange', 
  'purple', 
//  'cyan', 
  'magenta', 
//  'yellow', 
  'darkblue', 
  'darkgreen', 
//  'lightblue', 
//  'lightgreen', 
  'coral', 
//  'gold', 
  'salmon', 
  'slateblue', 
  'teal', 
  'olive', 
  'brown', 
  'darkorange'
];

/** Arrowheads are defined by colour name (e.g. arrowhead-blue). Use this so marker-end works when node.color is a name or a hex from presets. */
const hexToColourName = {
  "#f00": "red", "#ff0000": "red", "#c00": "red", "#e88": "red",
  "#0f0": "green", "#00ff00": "green", "#0c0": "green", "#8e8": "green", "#00aa55": "green",
  "#00f": "blue", "#0000ff": "blue", "#00aaff": "blue",
  "#ff8000": "orange", "#ff5000": "orange", "#f80": "orange",
  "#80f": "purple", "#800080": "purple", "#900090": "purple",
  "#f0f": "magenta", "#ff00ff": "magenta"
};
function colourNameForArrowhead(c) {
  if (!c || typeof c !== "string") return "white";
  const key = c.toLowerCase();
  if (colours.includes(key)) return key;
  if (key.startsWith("#") && hexToColourName[key]) return hexToColourName[key];
  return "white";
}
function getArrowheadId(color) {
  return "arrowhead-" + colourNameForArrowhead(color);
}

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, windLayerCancel, windLayerStress, windLayerNetForceArrows, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();
// console.log("minDim " + minDim, "lime");
console.log("scaleUnit " + scaleUnit, "lime");
// console.log("width " + width, "lime");
// console.log("height " + height, "lime");
const metricsBody = d3.select("#metrics-panel tbody");
const COLS = [
  { key:"id",     fmt:d=>d.id                     },
  { key:"sum",    fmt:d=>d._sumF.toFixed(1)       },
  { key:"net",    fmt:d=>d._netF.toFixed(1)       },
  { key:"cancel", fmt:d=>d._cancel.toFixed(1)     },
  { key:"vx",     fmt:d=>d.vx.toFixed(1)          },
  { key:"vy",     fmt:d=>d.vy.toFixed(1)          }
];
// build the metrics panel once ──────────────────────────────────────────
const metPanel = d3.select("#metrics-panel")
                   .append("table")
                   .attr("class", "metrics");

metPanel.append("thead").append("tr").selectAll("th")
        .data(["id", "fix", "x", "y", "Σ|F|", "|ΣF|", "cancel", "vx", "vy"])
        .enter().append("th")
        .text(d => d);

const tbody = metPanel.append("tbody").attr("id","metrics-body");;
const tfoot = metPanel.append("tfoot");

// 2) Draw axes
const { xScale, yScale, xAxis, yAxis } = Drawing.createAxes(container, width, height, minDim);

// 2b) Grid lines every 10 (vertical V, horizontal H)
Drawing.createGridLines(container, xScale, yScale);

// 3) Arrowhead artefacts + shared patterns (e.g. diag-hatch for preset fill)
const defs = svg.append("defs").attr("id","defs").attr("width",100).attr("height",100);
Drawing.createArrowheads(defs, colours);

// Shared hatch patterns for nodeFill (can be referenced as url(#...))
const patterns = defs.append("g").attr("id", "patterns");
function addDiagHatchPattern(id, stroke) {
  const p = patterns.append("pattern")
    .attr("id", id)
    .attr("width", 6).attr("height", 6)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("patternTransform", "rotate(45)");
  p.append("rect")
    .attr("width", 6)
    .attr("height", 6)
    .attr("fill", "transparent");
  p.append("line")
    .attr("x1", 0).attr("y1", 0)
    .attr("x2", 0).attr("y2", 6)
    .attr("stroke", stroke)
    .attr("stroke-width", 11);
}
// Default + a few colour variants for presets to pick from
addDiagHatchPattern("diag-hatch",         "#ff8000"); // legacy/default
addDiagHatchPattern("diag-hatch-orange",  "#ff8000");
addDiagHatchPattern("diag-hatch-purple",  "#900090");

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

/** Split label into at most 2 lines for node circle; prefer split at space near midpoint. */
function splitLabelIntoTwoLines(label) {
  if (!label || label.length <= 8) return [label];
  const mid = Math.ceil(label.length / 2);
  const before = label.lastIndexOf(" ", mid);
  const splitAt = before >= Math.ceil(label.length * 0.3) ? before : mid;
  return [label.slice(0, splitAt).trim(), label.slice(splitAt).trim()];
}

function buildOrUpdateNodes(container, nodes) {
  
    nodeGroup = container.selectAll(".node-group")
      .data(nodes, d => d.id)      // key by node id
      .join(
        enter => {
          
          // For newly entered node(s):
          const g = enter.append("g")
            .attr("class", "node-group")
            .attr("id", d => "node-group-"+d.id)
            .on("dblclick", toggleFixed)
            .call(d3.drag()
              .on("start", dragStart)
              .on("drag", dragging)
              .on("end", dragEnd)
            );
          // highlight circle
          g.append("circle")
            .attr("class", "highlight-circle hidden")
            .attr("fill","none")
            .attr("opacity", 0.8)
            .attr("r",d => (d.radius +10) )
            ;

          // append the circle (fill: node.fill if set e.g. url(#diag-hatch), else node.color)
          g.append("circle")
            .attr("class", AppUI.showCircles.boolState? AppUI.showCircles.DOMObjectString : AppUI.showCircles.DOMObjectString + " hidden")
            .attr("fill", d => d.fill != null ? d.fill : d.color)
            .attr("id", d => "circle-"+d.id)
            .attr("opacity", 0.6)
            .attr("r", d => d.radius)
            .attr("stroke", d => d.isFixed ? "black" : "none")
            .attr("stroke-width", d => d.isFixed ? 3 : 0)
            .on("mouseover", function(event, d) {
              let targetElement = document.getElementById("spawn-cand-stress-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-cancel-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-netForceArrow-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("hotspot-group-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("node-relations-" + d.id);
              if (targetElement) { targetElement.classList.add("node-relation-hover");}
            })
            .on("mouseout", function(event, d) {
              let targetElement = document.getElementById("spawn-cand-stress-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("spawn-cand-cancel-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("spawn-cand-netForceArrow-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0"); }
              targetElement = document.getElementById("hotspot-group-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", "0.2"); }
              targetElement = document.getElementById("node-relations-" + d.id);
              if (targetElement) { targetElement.classList.remove("node-relation-hover"); }
            });
          // highlight circle + icon area (both toggled by Node icon [I])
          g.append("rect")
            .attr("class", d => d.representation ? "icon icon-bg node-icon icon-"+d.representation : "icon icon-bg node-icon")
            .attr("fill","none")
            .attr("opacity", 0.8)
            .attr("rx", 4)
            .attr("x", d => -d.radius/Math.SQRT2)
            .attr("y", d => -d.radius/Math.SQRT2)
            .attr("width", d => d.radius/Math.SQRT2*2 )    // 
            .attr("height", d => d.radius/Math.SQRT2*2 )   // 2* a^2 = r^2
            ;
          g.append("svg:image")
            .attr("href", d =>                               // ask the lookup map
                  d.representation!='none'? Icons.iconByKey[d.representation] : ''                //   match by key
              ) //iconByKey["03"])                           //   fallback
            .attr("x", d => -d.radius/Math.SQRT2 )
            .attr("y", d => -d.radius/Math.SQRT2 )
            .attr("width",  d => d.radius/Math.SQRT2*2)
            .attr("height", d => d.radius/Math.SQRT2*2)
            .attr("class", AppUI.showNodeIcon.boolState ? AppUI.showNodeIcon.DOMObjectString : AppUI.showNodeIcon.DOMObjectString + " hidden")
            .attr("fill", "white")
            .style("pointer-events","none");        // clicks still hit the <circle>
    
          // append ID label (centered in circle; wraps to 2 lines, font scales to fit radius; use d.displayLabel if set e.g. from spawn preset)
          g.each(function(d) {
            const raw = d.displayLabel != null ? String(d.displayLabel) : (typeof d.id === "string" ? d.id : String(d.id));
            const label = raw.length > 5 ? raw.slice(0, -5) : raw;
            const maxWidth = 2 * d.radius * 0.85;
            const split = splitLabelIntoTwoLines(label);
            const lines = split.length > 1 ? split : [label];
            const charsPerLine = Math.max(1, Math.ceil(label.length / lines.length));
            const fontSize = Math.min(12, Math.max(4, maxWidth / (charsPerLine * 0.55)));
            const textEl = d3.select(this).append("text")
              .attr("class", AppUI.showNodeLabel.boolState ? AppUI.showNodeLabel.DOMObjectString : AppUI.showNodeLabel.DOMObjectString + " hidden")
              .attr("id", AppUI.showNodeLabel.DOMObjectString + "-" + d.id)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("font-size", fontSize + "px");
            if (lines.length === 1) {
              textEl.append("tspan").attr("x", 0).attr("dy", 0).text(lines[0]);
            } else {
              textEl.append("tspan").attr("x", 0).attr("dy", "-0.5em").text(lines[0]);
              textEl.append("tspan").attr("x", 0).attr("dy", "1em").text(lines[1]);
            }
          });
  
          // append coords label (centered inside the node circle)
          g.append("text")
            .attr("class", "coord-label")
            .attr("id", d => "coord-label-"+d.id)
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            ;

          // Force arrows container
          g.append("g")
            .attr("class", "force-arrows")
            .attr("id", d => "force-arrows-"+d.id)
            ;

          // Node relations container
          g.append("g")
            .attr("class", "node-relations")
            .attr("id", d => "node-relations-" + d.id)
            ;
            
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


function randomHotspots(n=1){
  const arr = [];
  for (let i = 0; i < n; i++){
    arr.push({
      x : minDim * (Math.random() - 0.5),
      y : minDim * (Math.random() - 0.5),
      intensityFactor : 1.0,
      width  : 40 + 160 * Math.random(),
      height : 40 + 160 * Math.random(),
      forceType : "attract"
    });
  }
  return arr;
}

// function addOne() {
//   const newNode = {
//     id: "random-"+Date.now().toString(36).substring(2, 8),
//     x : minDim * (Math.random() - 0.5),
//     y : minDim * (Math.random() - 0.5),
//     color: colours[Math.floor(Math.random() * colours.length)],
//     radius: 10+30 * Math.random(),
//     isFixed: false,
//     significance: 1,
//     hotspots: randomHotspots(1+Math.floor(Math.random()*4))
//   };
  
//   Datasets.nodes.push(newNode);
//   // (A) Re-run hotspot data-join to create rects for newNode.hotspots
//   Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);

//   // (B) Re-run node data-join to create circles, labels, etc.
//   buildOrUpdateNodes(nodeLayer, Datasets.nodes);

//   // (C) Let the simulation know about new node
//   simulation.nodes(Datasets.nodes);       
//   simulation.alpha(1).restart(); 
// }

async function addOneSmart(){
  const template = {
    id   : "random-"+Date.now().toString(36).slice(-4),
    color: colours[Math.floor(Math.random()*colours.length)],
    radius: 10+30 * Math.random(),
    representation: Icons.randomRepresentation(),
    isFixed:false,
    significance:1,
    hotspots: randomHotspots(Math.floor(Math.random()*4)+2)
  };

  await addNodeWithMultistartVisual(
      Datasets.nodes,
      template,
      simulation,
      width, height, defs,
      windLayerCancel, windLayerStress, windLayerNetForceArrows,
      /* ticks   */ 80,
      /* cols    */ 20,
      /* rows    */ 20
  );
  // redraw DOM
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);
  buildOrUpdateNodes(nodeLayer,      Datasets.nodes);
  //simulation.nodes(Datasets.nodes).alpha(1).restart();
  simulation.nodes(Datasets.nodes);
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
 * @param {Number} width  current canvas extent
 * @param {Number} height  current canvas extent
 * @param {d3.Selection} defs    <defs> where gradients live
 * @param {d3.Selection} windLayerCancel  <g> used for debug crumbs
 * @param {d3.Selection} windLayerStress  <g> used for debug crumbs
 * @param {d3.Selection} windLayerNetForceArrows  <g> used for debug crumbs
 * @param {Number} ticks         mini–ticks per candidate   (default 30)
 * @param {Number} gridCols      lattice columns            (default 5)
 * @param {Number} gridRows      lattice rows               (default 5)
 */
export async function addNodeWithMultistartVisual(
  nodes, template, simulation,
  width, height, defs, 
  windLayerCancel, windLayerStress, windLayerNetForceArrows,
  ticks      = 80,
  gridCols   = 20,
  gridRows   = 20
){

  const snapshot = nodes.map(n=>({x:n.x,y:n.y,vx:n.vx,vy:n.vy}));
  let highestStress = -Infinity;
  let lowestStress = Infinity;
  let highestCancel = -Infinity;
  let longestArrow = -Infinity;
  let bestClone  = null;
  const dx = minDim  / gridCols;
  const dy = minDim / gridRows;
  
  // hide other heatmaps
  const windLayerCancelChildren = document.getElementById(AppUI.showWindCancel.DOMObjectString).childNodes;
  if(windLayerCancelChildren){
    windLayerCancelChildren.forEach((child) => {
      child.setAttribute("opacity",0);
    });
  }
  const windLayerStressChildren = document.getElementById(AppUI.showWindStress.DOMObjectString).childNodes;
  if(windLayerStressChildren){
    windLayerStressChildren.forEach((child) => {
      child.setAttribute("opacity",0);
    });
  }
  const windLayerNetForceArrowChildren = document.getElementById(AppUI.showWindNetForceArrows.DOMObjectString).childNodes;
  if(windLayerNetForceArrowChildren){
    windLayerNetForceArrowChildren.forEach((child) => {
      child.setAttribute("opacity",0);
    });
  }
  
  const gCancel = windLayerCancel.append("g")
    .attr("id","spawn-cand-cancel-"+template.id)
    .attr("class", AppUI.showWindCancel.boolState? AppUI.showWindCancel.DOMObjectString : AppUI.showWindCancel.DOMObjectString + " hidden")
    .attr("style","transition: all ease-in-out 0.2s;")
    .attr("opacity","0.5")
    ;
  const gStress = windLayerStress.append("g")
    .attr("id","spawn-cand-stress-"+template.id)
    .attr("class", AppUI.showWindStress.boolState? AppUI.showWindStress.DOMObjectString : AppUI.showWindStress.DOMObjectString + " hidden")
    .attr("style","transition: all ease-in-out 0.2s;")
    .attr("opacity","0.5")
    ;
  const gNetForceArrows = windLayerNetForceArrows.append("g")
    .attr("id","spawn-cand-netForceArrow-"+template.id)
    .attr("class", AppUI.showWindNetForceArrows.boolState? AppUI.showWindNetForceArrows.DOMObjectString : AppUI.showWindNetForceArrows.DOMObjectString + " hidden")
    .attr("style","transition: all ease-in-out 0.2s;")
    .attr("opacity","0.5")
    ;
    
  for (let gy = 0; gy < gridRows; gy++){
    for (let gx = 0; gx < gridCols; gx++){
      // cx,cy is the centre of the current grid cell (0,0) in canvas centre
      let cx = (gx + 0.5) * dx - minDim  / 2;
      let cy = (gy + 0.5) * dy - minDim / 2;

      // 1 ‧ clone template & position ---------------------------------------
        let cand = structuredClone(template);
        cand.x = cx;
        cand.y = cy;
        cand.id += `-g${gx}-${gy}`;

      // 2 ‧ ensure gradients -------------------------------------------------
        cand.hotspots.forEach(h=>Heatmaps.ensureColourGradient(defs,cand.color));

      // 3 ‧ push ghost & run a few ticks ------------------------------------
        nodes.push(cand);
        //buildOrUpdateNodes(nodeLayer, nodes);
        //simulation.nodes(nodes); // <- this made everything jump each time
        // approach to fix the jumping: A. before the mini–ticks
        const mini = d3.forceSimulation(nodes.concat(cand))
          .force("gauss", Forces.forceGaussianPreferredArea(1.5))
          .force("coll", Forces.forceCustomCollision)
          ;
        mini.tick(); // single tick to capture immediate forces, for net arrows
          const netForceX = cand.vx;
          const netForceY = cand.vy;
        for (let t=1; t<ticks; t++) mini.tick(); // and now the rest of the ticks
        //for (let t=0; t<ticks; t++) mini.tick();
        mini.stop(); // dispose
        //approach to fix the jumping: B: for (let t=0; t<ticks; t++) simulation.tick();

      // reposition the <g>s back to their original position as they may have moved in the few ticks just now
        // cand.x = cx;
        // cand.y = cy;
        
      // 4 ‧ scores and metrics  ------------------------------
        const stress = cand.forces.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0); // old metric
        //const totMag = cand.forces.reduce((s,f)=>s+Math.hypot(f.fx,f.fy),0);
        const sx     = cand.forces.reduce((s,f)=>s+f.fx,0);
        const sy     = cand.forces.reduce((s,f)=>s+f.fy,0);
        const netMag = Math.hypot(sx,sy);
        const cancel = stress - netMag; // Σ|Fi| − |ΣFi|

      // 5 ‧ breadcrumb ------------------------------------------------------
      // 5.1 breadcrumb cancel
        const trialGCancel = gCancel.append("g")
          .attr("transform",`translate(${cx},${cy})`);
        trialGCancel.append("rect")
          .attr("cancel",cancel)
          .attr("width",dx)
          .attr("height",dy)
          .attr("x",-dx/2)
          .attr("y",-dy/2)
          .attr("fill",cand.color).attr("fill-opacity",0.125*cancel/10)
          ;
        const gTextCancel = trialGCancel.append("text")
          .attr("class", AppUI.showWindCancelLabel.boolState? AppUI.showWindCancelLabel.DOMObjectString + " graph-label" : AppUI.showWindCancelLabel.DOMObjectString + " graph-label hidden")
          .attr("x",0).attr("dy","20px");
        gTextCancel.append("tspan").text(`${cancel.toFixed(1)}`).attr("dy","0em");
      
      // 5.2 breadcrumb stress
        const trialGStress = gStress.append("g")
          .attr("transform",`translate(${cx},${cy})`);
        trialGStress.append("rect")
          .attr("stress",stress)
          .attr("width",dx)
          .attr("height",dy)
          .attr("x",-dx/2)
          .attr("y",-dy/2)
          .attr("fill",cand.color).attr("fill-opacity",0.125*stress/10)
          ;
        const gTextStress = trialGStress.append("text")
          .attr("class", AppUI.showWindStressLabel.boolState? AppUI.showWindStressLabel.DOMObjectString + " graph-label" : AppUI.showWindStressLabel.DOMObjectString + " graph-label hidden")
          .attr("x",0).attr("dy","20px");
        gTextStress.append("tspan").text(`${stress.toFixed(1)}`).attr("dy","1.2em");

      // 5.3 breadcrumb netForceArrow
        const trialGNetForceArrows = gNetForceArrows.append("g")
        .attr("transform",`translate(${cx},${cy})`);
        // const netForceX = cand.vx;
        // const netForceY = cand.vy;
        const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

        //if (netForceMagnitude > 0.1) {
          const netLength = Math.min(netForceMagnitude * 5, 1000);
          const netAngle = Math.atan2(netForceY, netForceX);

          trialGNetForceArrows.append("line")
              //.attr("class", (AppUI.showNetForce.boolState) ? AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow hidden")
              .attr("x1", 0)
              .attr("y1", 0)
              .attr("x2", netLength * Math.cos(netAngle))
              .attr("y2", netLength * Math.sin(netAngle))
              .attr("netForceMagnitude", netForceMagnitude)
              .attr("netLength", netLength)
              .attr("stroke", cand.color)
              .attr("stroke-width", 3)
              .attr("marker-end", "url(#"+getArrowheadId(cand.color)+")")
              .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);
        //}

      // 6 ‧ keep best --------------------------------------------------------
        if (cancel > highestCancel){
          highestCancel = cancel;
          //bestClone  = structuredClone(cand);
        }
        if (stress < lowestStress){
          lowestStress = stress;
          // bestClone  = structuredClone(cand);
        }
        if (stress > highestStress){
          highestStress = stress;
          bestClone  = structuredClone(cand);
        }
        if (netLength > longestArrow){
          longestArrow = netLength;
        }

      // 7 ‧ pop ghost -------------------------------------------------------
        nodes.pop();
        nodeLayer.selectAll(".node-group")
          .filter(d => d.id === cand.id)
          .remove();
    }
  }

  // adjust the sizes and opacities of circles, rectangles and lines
  const spawnCandCancel = document.getElementById("spawn-cand-cancel-"+template.id).childNodes;
    spawnCandCancel.forEach((child, index) => {
      child.firstChild.setAttribute("fill-opacity",0.5*child.firstChild.getAttribute("cancel")/highestCancel);
      child.firstChild.setAttribute("r",dx/2*child.firstChild.getAttribute("cancel")/highestCancel);
    });
  const spawnCandStress = document.getElementById("spawn-cand-stress-"+template.id).childNodes;
    spawnCandStress.forEach((child, index) => {
      child.firstChild.setAttribute("fill-opacity",0.5*child.firstChild.getAttribute("stress")/highestStress);
    });
  const spawnCandNetForce = document.getElementById("spawn-cand-netForceArrow-"+template.id).childNodes;
    spawnCandNetForce.forEach((child, index) => {
      const netForceArrowRank = child.firstChild.getAttribute("netLength")/longestArrow;
      child.firstChild.setAttribute("x2",child.firstChild.getAttribute("x2")/longestArrow * netForceArrowRank * dx/2);
      child.firstChild.setAttribute("y2",child.firstChild.getAttribute("y2")/longestArrow * netForceArrowRank * dy/2);
    });
  
  // 8 ‧ commit winner -------------------------------------------------------
    bestClone.id = template.id;
    console.log('spawned '+bestClone.id+' at ' + (bestClone.x/scaleUnit).toFixed(0) + ', '+(-bestClone.y/scaleUnit).toFixed(0));
    //B snapshot.forEach((p,i)=>Object.assign(nodes[i],p));
    //nodes.push(bestClone);
    nodes.splice(nodes.length, 0, bestClone);   // push on the real array
    //buildOrUpdateNodes(nodeLayer, nodes);
    simulation.nodes(nodes).alpha(1).restart();
}


// ======= DRIP =========================================================================================================
let nodesQueue = [];

// // Then define a function to handle a button click or something:
// function spawnOneByOne(someDataArray) {
//   console.log('spawning set: ', "green");
//   // 1) Clear the array
//   nodesQueue.splice(0, nodesQueue.length);

//   // 2) put the items from someDataArray to the queue
//   nodesQueue = structuredClone(someDataArray);

//   // 3) Flip Y to treat up as positive
//   Datasets.flipYCoordinates(nodesQueue);

//   // 4) Fix initial nodes that are isFixed
//   Datasets.fixInitially(nodesQueue);

//   // 5) let it drip 
//   dripSpawnNodes(
//     nodesQueue,
//     Datasets.nodes,
//     hotspotLayer,
//     nodeLayer,
//     simulation,
//     1000 // 1 second between spawns
//   );
// }

// /**
//  * Timed "drip" approach to spawn nodes from a queue one at a time.
//  * @param {Array} nodesQueue     The array of node data to spawn over time.
//  * @param {Array} nodes          The main node array in the simulation.
//  * @param {d3.Selection} hotspotLayer The <g> container for hotspot rects.
//  * @param {d3.Selection} nodeLayer    The <g> container for node groups.
//  * @param {d3.Simulation} simulation  The d3 force simulation.
//  * @param {number} intervalMs    How many milliseconds between spawns, default 1000.
//  */
// export function dripSpawnNodes(
//   nodesQueue,
//   nodes,
//   hotspotLayer,
//   nodeLayer,
//   simulation,
//   intervalMs = 1000
// ) {
//   let i = 0; 
//   const intervalId = setInterval(() => {
//     if (i >= nodesQueue.length) {
//       clearInterval(intervalId);
//       return;
//     }

//     // Take the next node from the queue
//     const newNode = nodesQueue[i];
//     i++;
//     newNode.id = newNode.id + '-' + Date.now().toString(36).substring(2, 8);

//     // Add to the main node array
//     nodes.push(newNode);

//     // Re-run the hotspot data-join so new hotspots appear
//     Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);

//     // Re-run the node data-join so new node circles/labels appear
//     buildOrUpdateNodes(nodeLayer, nodes);

//     // Let the simulation know about the new array
//     simulation.nodes(nodes);
//     simulation.alpha(1).restart();

//   }, intervalMs);
// }

/**
 * Spawn every node in `queue` one–by–one.
 * Each node is positioned with addNodeWithMultistartVisual, waiting
 * `intervalMs` between completions so you see them appear sequentially.
 *
 * @param {Object[]} nodesQueue           array of *raw* node objects
 * @param {Object[]} nodes      the real nodes array that drives D3
 * @param {d3.Simulation} simulation your running force simulation
 * @param {Number} width,height      canvas extent (needed by smart placer)
 * @param {d3.Selection} defs        <defs> for gradients
 * @param {d3.Selection} hotspotLayer  <g>   – already created in main file
 * @param {d3.Selection} nodeLayer      <g>
 * @param {d3.Selection} windCancelLayer   <g> debug
 * @param {d3.Selection} windStressLayer   <g> debug
 * @param {d3.Selection} windNetLayer      <g> debug
 * @param {Number} intervalMs         delay **after** each spawn (default 1 s)  (old timed mode, now unused)
 */

// Helper: wait until a node “settles” (speed below threshold for some time).
// Does NOT change isFixed/fx/fy – caller decides what to do once settled,
// based on e.g. `sequenceMode` (fixing vs floating).
async function waitForNodeToSettle(node, simulation, {
  speedThreshold = 0.5,     // px per tick (in simulation units)
  stableMs       = 800,     // how long it must stay below threshold
  checkInterval  = 80       // ms between checks
} = {}) {
  return new Promise(resolve => {
    if (!node) return resolve();

    let stableFor = 0;
    const id = node.id;

    const intervalId = setInterval(() => {
      // Node might have been removed
      if (!Datasets.nodes.includes(node)) {
        clearInterval(intervalId);
        return resolve();
      }

      const vx = node.vx ?? 0;
      const vy = node.vy ?? 0;
      const speed = Math.hypot(vx, vy);

      if (speed < speedThreshold) {
        stableFor += checkInterval;
        if (stableFor >= stableMs) {
          clearInterval(intervalId);
          resolve();
        }
      } else {
        stableFor = 0; // reset timer if it speeds up again
      }
    }, checkInterval);
  });
}

/** Queue of the current spawn run; cleared by Delete All so no more nodes are spawned. */
let currentSpawnQueue = null;

export function clearSpawnQueue() {
  if (currentSpawnQueue) currentSpawnQueue.length = 0;
  currentSpawnQueue = null;
}

export async function dripSpawnSmart(
  nodesQueue,
  nodes,
  simulation,
  width, height, defs,
  hotspotLayer, nodeLayer,
  windCancelLayer, windStressLayer, windNetLayer,
  intervalMs = 1000   // NOTE: kept for reference; old timed mode was using this
){
  // make a shallow clone so we can shift() without mutating the original
  const todo = nodesQueue.slice();
  currentSpawnQueue = todo;

  async function next () {
    if (todo.length === 0) return;

    const raw = structuredClone(todo.shift());           // fresh copy
    raw.id += '-' + Date.now().toString(36).slice(-4);   // unique-ify id
    
    if (raw.color === "random") { raw.color = colours[Math.floor(Math.random()*colours.length)]; }
    
    Datasets.adjustCoordinatesToScale([raw], scaleUnit);
    Datasets.flipYCoordinates([raw]);                    // keep y-up
    Datasets.fixInitially([raw]);

    // --- run the lattice search ------------------------------------------
    await addNodeWithMultistartVisual(
      nodes, raw, simulation,
      width, height, defs,
      windCancelLayer, windStressLayer, windNetLayer,
      /* ticks  */ 80,
      /* cols   */ 20,
      /* rows   */ 20
    );

    // --- refresh DOM / forces --------------------------------------------
    Heatmaps.buildHeatspotRects(hotspotLayer, nodes, defs);
    buildOrUpdateNodes(nodeLayer,      nodes);
    simulation.nodes(nodes).alpha(1).restart();

    // Find the just-added node by id (after multistart it should be present in `nodes`)
    const spawned = nodes.find(n => n.id === raw.id);

    // NEW MODE: wait until this node settles, then (optionally) fix it and move on
    await waitForNodeToSettle(spawned, simulation, {
      speedThreshold: 0.5,
      stableMs: 800,
      checkInterval: 80
    });

    // Depending on the global sequenceMode, either fix the node
    // (like a double–click) or leave it floating.
    if (spawned && sequenceMode === "fixing") {
      spawned.isFixed = true;
      spawned.fx = spawned.x;
      spawned.fy = spawned.y;

      // Visual cue (black stroke) – mirror toggleFixed behaviour
      const sel = d3.select(`#node-group-${spawned.id}`).select("circle");
      sel.attr("stroke", "black").attr("stroke-width", 3);

      simulation.alpha(0.5).restart();
    }

    // OLD MODE (timed drip), kept here for reference:
    // setTimeout(next, intervalMs);

    // Spawn the next as soon as this one has settled
    next();
  }

  next();    // kick-off
}

// ======== REMOVE ========================================================================================================

function removeNodeById(id){
  /* 1 ▸ delete from the data array */
  const idx = Datasets.nodes.findIndex(n => n.id === id);
  if(idx === -1) return;                       // safety
  Datasets.nodes.splice(idx,1);

  /* 2 ▸ scrub ALL SVG fragments that carry that id */
  d3.select(`#node-group-${id}`).remove();       // main glyph
  d3.select(`#hotspot-group-${id}`).remove();    // its heatmaps
  d3.select(`#spawn-cand-stress-${id}`).remove();// wind breadcrumbs
  d3.select(`#spawn-cand-cancel-${id}`).remove();
  d3.select(`#spawn-cand-netForceArrow-${id}`).remove();

  /* 3 ▸ refresh joins + forces */
  Heatmaps.buildHeatspotRects(hotspotLayer, Datasets.nodes, defs);
  buildOrUpdateNodes(nodeLayer,           Datasets.nodes);

  simulation.nodes(Datasets.nodes).alpha(1).restart();
}

function removeAllNodes() {

  console.log('removed all nodes.','red');
  // 1) Clear the array
  Datasets.nodes.splice(0, Datasets.nodes.length);

  // clear the wind-force groups
  document.getElementById(AppUI.showWindStress.DOMObjectString).innerHTML='';
  document.getElementById(AppUI.showWindCancel.DOMObjectString).innerHTML='';
  document.getElementById(AppUI.showWindNetForceArrows.DOMObjectString).innerHTML='';

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

const forceCollide = d3.forceCollide().radius(d => d.radius + Datasets.collisionMargin).strength(1.2); // unchanged from original
const forceRepel = d3.forceManyBody().strength(d => d.isFixed ? 0 : -50); // Mild repulsion between nodes
let collisionEnabled = true;

const simulation = d3.forceSimulation(Datasets.nodes)
    .force('travel', Forces.forceTravel(Datasets.nodes))
    .force("repel", forceRepel)
    .force("collide", forceCollide)
    .force("gaussian", Forces.forceGaussianPreferredArea(1.5, () => collisionEnabled))
    .force("customCollision", Forces.forceCustomCollision)
    .on("tick", ticked);

function setCollisionEnabled(enabled) {
  collisionEnabled = enabled;
  Forces.nodeNodeCollisionInGaussian = enabled;
  simulation.force("repel", enabled ? forceRepel : null);
  simulation.force("collide", enabled ? forceCollide : null);
  simulation.force("customCollision", enabled ? Forces.forceCustomCollision : null);
  simulation.alpha(0.3).restart();
}


function ticked() {
    if (!nodeGroup) return;   // If it's undefined, skip
    nodeGroup.attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Update coordinates label
    if (AppUI.showCoordinates.boolState) {
      nodeGroup.select("."+AppUI.showCoordinates.DOMObjectString)
        //.text(d => `(${Math.round(d.x * scaleUnit)}, ${Math.round(-d.y * scaleUnit)})`);
        .text(d => `(${Math.round(d.x / scaleUnit)}, ${Math.round(-d.y / scaleUnit)})`);
    }
    
    // Clear previous arrows before drawing new ones
    nodeGroup.selectAll("."+AppUI.showForceArrows.DOMObjectSingleString+", ."+AppUI.showForceArrows.DOMObjectSingleString+"-value, ."+AppUI.showForceArrows.DOMObjectSingleString+"-label-group").remove();  
    nodeGroup.selectAll("."+AppUI.showNodeLines.DOMObjectSingleString+", ."+AppUI.showNodeLines.DOMObjectSingleString+"-value, ."+AppUI.showNodeLines.DOMObjectSingleString+"-label-group").remove();  

    nodeGroup.select("."+AppUI.showCircles.DOMObjectString)
      .attr("r",      d => d.radius)
      .attr("stroke", d => d.isFixed ? "black" : "none")
      .attr("stroke-width", d => d.isFixed ? 3 : 0);
      nodeGroup.select(".highlight-circle")
      .attr("r",      d => d.radius+10)
      ;

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
          //.attr("class", AppUI.showForceArrows.boolState? AppUI.showForceArrows.DOMObjectSingleString+"-label-group" : AppUI.showForceArrows.DOMObjectSingleString+"-label-group hidden")
          .attr("class", (AppUI.showForceArrows.boolState && AppUI.showForceArrowsLabels.boolState)? AppUI.showForceArrows.DOMObjectSingleString+"-label-group" : AppUI.showForceArrows.DOMObjectSingleString+"-label-group hidden")
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

      //if (AppUI.showNetForce.boolState) {
      if (AppUI.showForceArrows.boolState) {
        const netForceX = d.vx;
        const netForceY = d.vy;
        const netForceMagnitude = Math.sqrt(netForceX ** 2 + netForceY ** 2);

        if (netForceMagnitude > 0.1) {
          const netLength = Math.min(netForceMagnitude * 5, 1000);
          const netAngle = Math.atan2(netForceY, netForceX);

          arrowGroup.append("line")
            //.attr("class", (AppUI.showNetForce.boolState) ? AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow hidden")
            .attr("class", (AppUI.showForceArrows.boolState) ? AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow" : AppUI.showForceArrows.DOMObjectSingleString+" net-force-arrow hidden")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", netLength * Math.cos(netAngle))
            .attr("y2", netLength * Math.sin(netAngle))
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead-red)")
            .style("opacity", netForceMagnitude > 0.9 ? 0.8 : 0.5);
        }
      }
    });
    updateMetrics(Datasets.nodes, currentSpawnQueue);   //
}
    
let lastMetricsUpdate = 0;
function updateMetrics(nodes, queue){
  queue = queue || [];
  const combined = [
    ...nodes.map(d => ({ key: d.id, isQueued: false, node: d })),
    ...queue.map((d, i) => ({ key: "queue-" + i, isQueued: true, node: d }))
  ];

  /*────────────────────────────────────────  ROWS  ─────────────────────────*/
  const rows = tbody.selectAll("tr")
      .data(combined, d => d.key)
      .join("tr")
        .attr("data-id", d => d.node.id)
        .classed("metrics-row-queued", d => d.isQueued)
        .on("mouseenter", handleEnter)
        .on("mouseleave", handleLeave);

  /*────────────────────────────────  (re)compute metrics (active only)  ────*/
  rows.each(d => {
    if (d.isQueued) return;
    const n = d.node;
    const F   = n.forces ?? [];
    const sum = F.reduce((s,f)=>s + Math.hypot(f.fx,f.fy), 0);
    const netx= F.reduce((s,f)=>s + f.fx, 0);
    const nety= F.reduce((s,f)=>s + f.fy, 0);
    const net = Math.hypot(netx, nety);
    n._sumF   = sum;
    n._netF   = net;
    n._cancel = sum - net;
  });

  /*────────────────────── first cell  (label + remove-btn or pending)  ─────*/
  rows.selectAll("td.rowLabel")
      .data(d => [d])
      .join(
        enter => enter.append("td").attr("class", "rowLabel").each(function(d) {
          const sel = d3.select(this);
          if (d.isQueued) {
            sel.html(`<span class="name">${d.node.id}</span><span class="queued-badge" title="Awaiting introduction">pending</span>`);
          } else {
            sel.html(`
              <span class="name">${d.node.id}</span>
              <button class="remove-btn" title="Delete ${d.node.id}" data-id="${d.node.id}">✕</button>`);
          }
        }),
        update => update.each(function(d) {
          const sel = d3.select(this);
          if (d.isQueued) {
            sel.html(`<span class="name">${d.node.id}</span><span class="queued-badge" title="Awaiting introduction">pending</span>`);
          } else {
            sel.html(`
              <span class="name">${d.node.id}</span>
              <button class="remove-btn" title="Delete ${d.node.id}" data-id="${d.node.id}">✕</button>`);
          }
        })
      );

  /*──────────────────────  fixed checkbox cell  ────────────────────────────*/
  rows.selectAll("td.fixed-cell")
      .data(d => [d])
      .join(
        enter => enter.append("td").attr("class", "fixed-cell").each(function(d) {
          const sel = d3.select(this);
          if (d.isQueued) {
            sel.text("—").classed("metric-pending", true);
          } else {
            sel.append("label").attr("class", "fixed-checkbox-label")
              .append("input").attr("type", "checkbox")
              .attr("title", "Fix/unfix node position")
              .property("checked", d => d.node.isFixed)
              .on("change", function(event, rowD) {
                event.stopPropagation();
                setNodeFixed(rowD.node, this.checked);
              });
          }
        }),
        update => update.each(function(d) {
          const sel = d3.select(this);
          if (d.isQueued) {
            sel.text("—").classed("metric-pending", true);
            sel.selectAll("label").remove();
          } else {
            sel.classed("metric-pending", false);
            sel.select("input").property("checked", d.node.isFixed);
          }
        })
      );

  /*──────────────────────  numeric metric cells (7 of them)  ───────────────*/
  rows.selectAll("td.metric")
      .data(d => d.isQueued
        ? ["—", "—", "—", "—", "—", "—", "—"]
        : [
            (d.node.x/scaleUnit).toFixed(0),
            (-d.node.y/scaleUnit).toFixed(0),
            d.node._sumF  .toFixed(0),
            d.node._netF  .toFixed(0),
            d.node._cancel.toFixed(0),
            d.node.vx .toFixed(0),
            d.node.vy .toFixed(0)
          ])
      .join(
        enter => enter.append("td").attr("class", "metric").text(t => t),
        update => update.text(t => t)
      );

  /*──────────────────────────────  FOOTER  Σ and μ  ────────────────────────*/
  const {sum, avg} = summarise(nodes);
  const footData = [
    ["Σ", null, null, null, sum.sumF,sum.netF,sum.cancel, sum.vx,sum.vy],
    ["μ", null, null, null, avg.sumF,avg.netF,avg.cancel, avg.vx,avg.vy]
  ];

  const footRows = tfoot.selectAll("tr")
      .data(footData)
      .join("tr");

  footRows.selectAll("td")
      .data(d => d)
      .join("td")
      .text(d => (Number.isFinite(d) ? d.toFixed(0) : d ?? ""));

  /*──────────────────────── delegated click → remove  ──────────────────────*/
  // d3.select("#metrics-panel")
  //   .on("click", function(e){
  //     if (e.target.classList.contains("remove-btn")){
  //       console.log("remove node "+e.target.dataset.id);
  //       removeNodeById(e.target.dataset.id);
  //     }
  //   });
}


function handleEnter() {
  const id = this.dataset.id;                        // row / th data-id
  d3.select(`#node-group-${id} .highlight-circle`)
    .classed("hidden", false)
    .classed("haloSpin", true)
    ;                       
}

function handleLeave() {
  const id = this.dataset.id;
  d3.select(`#node-group-${id} .highlight-circle`)
    .classed("hidden", true)
    .classed("haloSpin", false)
    ;
}

function summarise(nodes){
  const n = nodes.length || 1;                         // avoid /0
  const sum = {x:0,y:0,sumF:0,netF:0,cancel:0,vx:0,vy:0};
  nodes.forEach(d=>{
    sum.x      += d.x;
    sum.y      += d.y;
    sum.sumF   += d._sumF;
    sum.netF   += d._netF;
    sum.cancel += d._cancel;
    sum.vx     += d.vx;
    sum.vy     += d.vy;
  });
  const avg = Object.fromEntries(
    Object.entries(sum).map(([k,v]) => [k,v/n])
  );
  return {sum,avg};
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

function setNodeFixed(node, fixed) {
  node.isFixed = !!fixed;
  if (node.isFixed) {
    node.fx = node.x;
    node.fy = node.y;
  } else {
    node.fx = null;
    node.fy = null;
  }
  const sel = d3.select(`#node-group-${node.id}`).select("circle");
  if (!sel.empty()) {
    sel.transition().duration(200)
      .attr("stroke", node.isFixed ? "black" : "none")
      .attr("stroke-width", node.isFixed ? 3 : 0);
  }
  simulation.alpha(0.5).restart();
}

function toggleFixed(event, d) {
  setNodeFixed(d, !d.isFixed);
}

let draggedContainer = null; // Declare draggedContainer outside

function setupDragAndDropForSpawnButtons() {
  const buttonContainers = document.querySelectorAll('.button-container');

  buttonContainers.forEach(container => {
      const dragIcon = container.querySelector('.drag-icon');
      if (dragIcon){
        dragIcon.addEventListener('dragstart', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up to the canvas
            draggedContainer = container; // Store the currently dragged container
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', container.innerHTML); // Store the inner HTML for drop
            container.classList.add('dragging'); // Optional: Add a class for styling
        });

        dragIcon.addEventListener('dragend', () => {
            if (draggedContainer) {
                draggedContainer.classList.remove('dragging'); // Remove the dragging class
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            e.stopPropagation(); // Prevent event from bubbling up to the canvas
            container.classList.add('highlight'); // Add highlight class
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('highlight'); // Remove highlight class when leaving
        });

        container.addEventListener('drop', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up to the canvas
            e.preventDefault();
            if (draggedContainer && draggedContainer !== container) {
                // Insert the dragged container before or after the current container
                const bounding = container.getBoundingClientRect();
                const offset = bounding.y + bounding.height / 2;
                if (e.clientY - offset > 0) {
                    container.after(draggedContainer); // Move dragged container after the current one
                } else {
                    container.before(draggedContainer); // Move dragged container before the current one
                }
            }
            container.classList.remove('highlight'); // Remove highlight class after drop
        });
      }

  });
}


// ================================================================================================================
// =============== LISTENERS =======================================================================================
// ================================================================================================================

//document.getElementById("spawnOneButton").addEventListener("click", addOne);
document.getElementById("removeAllButton").addEventListener("click", () => {
  clearSpawnQueue();
  removeAllNodes();
  updateSettingsURLParam(SETTINGS_PARAMS.spawn, "", "");
});
document.getElementById("addOneSmartButton").addEventListener("click", addOneSmart);
document.getElementById("downloadSVGButton")
  .addEventListener("click", () => {
    exportSquareSVG("bubblesExportFigure.svg");
  });

document.getElementById("downloadPNGButton")
  .addEventListener("click", () => {
    exportSquarePNG("bubblesExportFigure.png", 4);
  });

document.getElementById("downloadCSVButton")
  .addEventListener("click", () => {
    exportMetricsCSV("bubblesMetrics.csv", Datasets.nodes, scaleUnit);
  });

// View panel: clickable caret in header (same as KeyV)
const viewPanelCaret = document.getElementById("view-panel-caret");
const viewPanelCheckbox = document.getElementById("toggleViewPanel");
if (viewPanelCaret && viewPanelCheckbox) {
  function updateViewPanelCaret() {
    viewPanelCaret.textContent = AppUI.showViewPanel.boolState ? "\u25BC" : "\u25B2"; // ▼ expanded, ▲ collapsed
  }
  updateViewPanelCaret();
  viewPanelCaret.addEventListener("click", () => {
    AppUI.showViewPanel.boolState = !AppUI.showViewPanel.boolState;
    AppUI.showOrHideElement(AppUI.showViewPanel.boolState, "." + AppUI.showViewPanel.DOMObjectString, AppUI.showViewPanel.shorthandString, AppUI.showViewPanel.URLParamString, AppUI.showViewPanel.defaultState);
    viewPanelCheckbox.checked = AppUI.showViewPanel.boolState;
    updateViewPanelCaret();
  });
  viewPanelCheckbox.addEventListener("change", updateViewPanelCaret);
}

// Settings panel: persist to URL (same pattern as View panel)
function updateSettingsURLParam(param, value, defaultValue) {
  const url = new URL(window.location);
  if (value === defaultValue || value == null) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, String(value));
  }
  window.history.replaceState({}, "", url);
}

const SETTINGS_PARAMS = {
  sequence: "sequenceMode",   // fixing | floating, default fixing
  background: "bgPreset",     // preset id, default first preset
  collision: "collision",     // 1 = on, 0 = off, default on
  spawn: "spawn",             // preset id to auto-start on load (e.g. ?spawn=power-all)
};
const urlParams = new URLSearchParams(window.location.search);

// Settings panel: Sequence behaviour (fixing vs floating)
const seqFix = document.getElementById("sequence-fixing");
const seqFloat = document.getElementById("sequence-floating");
if (seqFix && seqFloat) {
  const seqFromUrl = urlParams.get(SETTINGS_PARAMS.sequence);
  if (seqFromUrl === "floating") {
    sequenceMode = "floating";
    seqFloat.checked = true;
  } else {
    sequenceMode = "fixing";
    seqFix.checked = true;
  }

  seqFix.addEventListener("change", () => {
    if (seqFix.checked) {
      sequenceMode = "fixing";
      updateSettingsURLParam(SETTINGS_PARAMS.sequence, "fixing", "fixing");
    }
  });
  seqFloat.addEventListener("change", () => {
    if (seqFloat.checked) {
      sequenceMode = "floating";
      updateSettingsURLParam(SETTINGS_PARAMS.sequence, "floating", "fixing");
    }
  });
}

// Settings panel: Collision detection
const collisionCheckbox = document.getElementById("setting-collision");
if (collisionCheckbox) {
  const collFromUrl = urlParams.get(SETTINGS_PARAMS.collision);
  if (collFromUrl === "0" || collFromUrl === "false") {
    collisionEnabled = false;
    Forces.nodeNodeCollisionInGaussian = false;
    simulation.force("repel", null);
    simulation.force("collide", null);
    simulation.force("customCollision", null);
    collisionCheckbox.checked = false;
  } else {
    collisionEnabled = true;
    Forces.nodeNodeCollisionInGaussian = true;
    collisionCheckbox.checked = true;
  }
  collisionCheckbox.addEventListener("change", () => {
    const enabled = collisionCheckbox.checked;
    setCollisionEnabled(enabled);
    updateSettingsURLParam(SETTINGS_PARAMS.collision, enabled ? "1" : "0", "1");
  });
}

// Settings panel: Background preset dropdown (each preset shows a set of images)
function applyBackgroundSelection(presetId) {
  const preset = presetId ? backgroundPresets.find(p => p.id === presetId) : null;
  const showNames = preset ? new Set(preset.imageNames) : new Set();
  container.select("#background-layer").selectAll("image").attr("visibility", function () {
    const name = d3.select(this).attr("data-background-name");
    return showNames.has(name) ? "visible" : "hidden";
  });
}
const bgSelect = document.getElementById("background-select");
if (bgSelect) {
  backgroundPresets.forEach(({ id, label }) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    bgSelect.appendChild(opt);
  });

  const defaultPresetId = backgroundPresets[0] ? backgroundPresets[0].id : "";
  const bgFromUrl = urlParams.get(SETTINGS_PARAMS.background);
  const validPresetId = backgroundPresets.some(p => p.id === bgFromUrl) ? bgFromUrl : defaultPresetId;
  bgSelect.value = validPresetId;
  applyBackgroundSelection(validPresetId);

  bgSelect.addEventListener("change", () => {
    const id = bgSelect.value;
    applyBackgroundSelection(id);
    updateSettingsURLParam(SETTINGS_PARAMS.background, id, defaultPresetId);
  });

  // Keep dropdown enabled only when the Background layer is visible.
  const bgToggle = document.getElementById("toggleBackground");
  if (bgToggle) {
    bgSelect.disabled = !bgToggle.checked;
    bgToggle.addEventListener("change", () => {
      bgSelect.disabled = !bgToggle.checked;
    });
  }
}

/** Build spawn buttons from spawnPresets (dataset registry). Each preset = one button; presets with same panelId go in that container. */
function buildSpawnButtonsFromPresets() {
  const containersByPanelId = {};
  spawnPresets.forEach((preset) => {
    const panelId = preset.panelId;
    if (!panelId) return;
    if (!containersByPanelId[panelId]) {
      const el = document.getElementById(panelId);
      if (el) containersByPanelId[panelId] = el;
    }
  });

  spawnPresets.forEach((preset) => {
    const target = containersByPanelId[preset.panelId];
    if (!target) return;

    const wrapper = document.createElement("div");
    wrapper.className = "button-container";

    const btn = document.createElement("button");
    btn.textContent = preset.label;
    btn.id = `spawnButton-${preset.id}`;
    btn.style.backgroundColor = preset.uiButtonColour || "#ddd";

    btn.addEventListener("click", () => {
      const nodes = getNodesForPreset(preset);
      if (!nodes.length) return;
      updateSettingsURLParam(SETTINGS_PARAMS.spawn, preset.id, "");
      dripSpawnSmart(
        nodes,
        Datasets.nodes,
        simulation,
        width,
        height,
        defs,
        hotspotLayer,
        nodeLayer,
        windLayerCancel,
        windLayerStress,
        windLayerNetForceArrows,
        1000
      );
    });

    const handle = document.createElement("span");
    handle.className = "drag-icon";
    handle.draggable = true;
    handle.textContent = "☰";
    wrapper.append(btn, handle);
    target.append(wrapper);
  });

  setupDragAndDropForSpawnButtons();
}
document.querySelectorAll('.collapse-header').forEach(header => {
    header.addEventListener('click', function () {
        const container = this.parentElement; // Get the parent container
        const buttons = container.querySelectorAll('.button-container'); // Get all button containers
        const caret = this.querySelector('.caret');

        // Toggle active state for buttons
        buttons.forEach(button => {
            button.classList.toggle('active'); // Toggle visibility
        });

        // Check if any button is active and set max height
        const isAnyActive = Array.from(buttons).some(button => button.classList.contains('active'));
        container.style.height = isAnyActive ? `${buttons.length * 20+20}px` : '20px'; // Adjust height

        // Change caret direction
        caret.classList.toggle('active'); // Toggle rotation on caret
    });
});


buildSpawnButtonsFromPresets();

// Auto-start a spawn preset from URL (e.g. ?spawn=power-all)
const spawnPresetId = urlParams.get(SETTINGS_PARAMS.spawn);
if (spawnPresetId) {
  const preset = spawnPresets.find((p) => p.id === spawnPresetId);
  if (preset) {
    const nodes = getNodesForPreset(preset);
    if (nodes.length) {
      dripSpawnSmart(
        nodes,
        Datasets.nodes,
        simulation,
        width,
        height,
        defs,
        hotspotLayer,
        nodeLayer,
        windLayerCancel,
        windLayerStress,
        windLayerNetForceArrows,
        1000
      );
    }
  }
}

// ======== Metrics table ========================================

const table = document.querySelector('.metrics');

table.addEventListener('mouseover', (event) => {
    const cell = event.target;
    if (cell.tagName === 'TD' || cell.tagName === 'TH') {
        const index = cell.cellIndex; // Get the index of the hovered cell
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells[index]) {
                cells[index].style.backgroundColor = '#ffffaa'; // Change background color
            }
        });
    }
});

table.addEventListener('mouseout', (event) => {
    const cell = event.target;
    if (cell.tagName === 'TD' || cell.tagName === 'TH') {
        const index = cell.cellIndex; // Get the index of the hovered cell
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            if (cells[index]) {
                cells[index].style.backgroundColor = ''; // Reset background color
            }
        });
    }
});

tbody.on("click", function (e) {
  if (e.target.classList.contains("remove-btn")) {
    console.log("remove node" + e.target.dataset.id, "red");
    removeNodeById(e.target.dataset.id);
  }
  });

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
  const inputs = document.querySelectorAll('input[keyboardShortcut]');
  for (const input of inputs) {
    if (event.code === input.getAttribute("keyboardShortcut")) {
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change'));
      event.preventDefault();
      return;
    }
  }
  const buttons = document.querySelectorAll('#debug-panel button[keyboardShortcut]');
  for (const button of buttons) {
    if (event.code === button.getAttribute("keyboardShortcut")) {
      button.click();
      event.preventDefault();
      return;
    }
  }
});



async function initUnityDatasets() {
  // NOTE: paths are examples; adjust to wherever you put the .txt files
  await Datasets.loadUnityDataset(
    "data/2025-12-06-00-48-34-type-power-visualisations-flattened(22).txt",
    "type",
    "power",
    "Power - VR - descent - cycling",
    { color: "red" }
  );

}

// // Kick off the loading right away
// initUnityDatasets().then(() => {
//   // Once loaded, hook them into one of your spawn panels
//   if (spawnButtonContainerVR2) {
//     addSpawnButtons(Datasets.unityPreppedNodes, spawnButtonContainerVR2);
//   }
// });
