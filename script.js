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
import { setupLogger } from './js/logger.js';
import * as Exporter from './js/exporter.js';
import { getExportFilenameBase as getExportFilenameBaseFromExporter } from './js/exporter.js';
import { imagePaths, backgroundPresets, createBackgroundAppliers } from './js/backgrounds.js';
import { spawnPresets, getNodesForPreset } from './js/spawnPresets.js';
import { colours, colourNameForArrowhead, getArrowheadId } from './js/colours.js';
import { addNodeWithMultistartVisual } from './js/addNodeMultistart.js';
import { SETTINGS_PARAMS, updateSettingsURLParam, setupSettingsPanel } from './js/settings.js';
import { createNodeSpawn, clearSpawnQueue, getCurrentSpawnQueue } from './js/nodeSpawn.js';
import { setupListeners } from './js/listeners.js';
import { createMetricsUpdater, formatNodeLabel, splitLabelIntoTwoLines } from './js/metrics.js';
import { addDefaultHatchPatterns } from './js/patterns.js';
import * as NodeInteraction from './js/nodeInteraction.js';
import { createOnResize } from './js/viewport.js';


window.Datasets = Datasets;   // <-- makes Datasets visible in DevTools

// Global-ish setting for sequence behaviour in dripSpawnSmart
// "fixing" → fix node after it settles; "floating" → leave free.
let sequenceMode = "fixing";

// define container for explicit node-to-node links spawned from presets (by label), e.g. 1<-2, 1<-3
// Each entry: { fromLabel: string, toLabel: string }
let activeLinks = [];

// Set up the logger
setupLogger();

// ================================================================================================================
// =============== ONE TIME =======================================================================================
// ================================================================================================================

// 1) Create the SVG, container
const { svg, container, nodeLayer, hotspotLayer, linkLayer, windLayerCancel, windLayerStress, windLayerNetForceArrows, width, height, minDim, scaleUnit } = Drawing.createSvgAndContainer();
const onResize = createOnResize(svg, container, minDim);
/** Opacity of other nodes' hotspot groups when hovering a node or its metrics row. Lower = more dimmed. */
const HOTSPOT_OPACITY_OTHERS_ON_HOVER = 0.06;

// build the metrics panel once ──────────────────────────────────────────
const metPanel = d3.select("#metrics-panel")
                   .append("table")
                   .attr("class", "metrics");

metPanel.append("thead").append("tr").selectAll("th")
        .data(["nodeLabel", "fix", "x", "y", "⌀", "Σ|F|", "|ΣF|", "cancel", "vx", "vy"])
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
addDefaultHatchPatterns(defs);

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
  if (!label || label.length <= 5) return [label];
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
            .on("mouseenter", function(event, d) {
              tbody.select(`tr[data-id="${d.id}"]`).classed("row-highlight-from-canvas", true);
              // Highlight this node's observations, dim others
              hotspotLayer.selectAll(".hotspot-group").attr("opacity", HOTSPOT_OPACITY_OTHERS_ON_HOVER);
              d3.select(`#hotspot-group-${d.id}`).attr("opacity", 1);
            })
            .on("mouseleave", function(event, d) {
              tbody.select(`tr[data-id="${d.id}"]`).classed("row-highlight-from-canvas", false);
              // Restore all observations to default opacity
              hotspotLayer.selectAll(".hotspot-group").attr("opacity", 0.3);
            })
            .call(d3.drag()
              .on("start", (e, d) => NodeInteraction.dragStart(e, d, simulation))
              .on("drag", (e, d) => NodeInteraction.dragging(e, d, simulation))
              .on("end", (e, d) => NodeInteraction.dragEnd(e, d, simulation))
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
            .classed("node-fixed", d => d.isFixed)
            .attr("fill", d => d.fill != null ? d.fill : d.color)
            .attr("id", d => "circle-"+d.id)
            .attr("opacity", d => d.circleOpacity != null ? d.circleOpacity : 0.6)
            .attr("r", d => d.radius)
            .style("stroke", d => d.stroke != null ? d.stroke : null)
            .style("stroke-width", d => d.strokeWidth != null ? d.strokeWidth : null)
            .on("mouseover", function(event, d) {
              let targetElement = document.getElementById("spawn-cand-stress-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-cancel-" + d.id);
              if (targetElement) { targetElement.setAttribute("opacity", 0.6); }
              targetElement = document.getElementById("spawn-cand-netForceArrow-" + d.id);
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
            const label = formatNodeLabel(raw);
            const maxWidth = 2 * d.radius * 0.75;
            const split = splitLabelIntoTwoLines(label);
            const lines = split.length > 1 ? split : [label];
            const charsPerLine = Math.max(1, Math.ceil(label.length / lines.length));
            const fontSize = Math.min(18, Math.max(4, maxWidth / (charsPerLine * 0.55)));
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
          // If we want to handle updated nodes, set or transition them here, e.g., update.attr(...).transition(...) 
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

// randomHotspots moved to js/nodeSpawn.js
// addOneSmart moved to js/nodeSpawn.js
// waitForNodeToSettle, clearSpawnQueue, dripSpawnSmart moved to js/nodeSpawn.js
// removeNodeById, removeAllNodes moved to js/nodeSpawn.js (use nodeOps)


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
        .text(d => `(${Math.round(d.x / scaleUnit)}, ${Math.round(-d.y / scaleUnit)})`);
    }
    
    // Clear previous arrows before drawing new ones
    nodeGroup.selectAll("."+AppUI.showForceArrows.DOMObjectSingleString+", ."+AppUI.showForceArrows.DOMObjectSingleString+"-value, ."+AppUI.showForceArrows.DOMObjectSingleString+"-label-group").remove();  
    nodeGroup.selectAll("."+AppUI.showNodeLines.DOMObjectSingleString+", ."+AppUI.showNodeLines.DOMObjectSingleString+"-value, ."+AppUI.showNodeLines.DOMObjectSingleString+"-label-group").remove();  

    nodeGroup.select("."+AppUI.showCircles.DOMObjectString)
      .attr("r", d => d.radius)
      .classed("node-fixed", d => d.isFixed)
      .style("stroke", d => d.stroke != null ? d.stroke : null)
      .style("stroke-width", d => d.strokeWidth != null ? d.strokeWidth : null);
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
    // Update explicit node-to-node link arrows (spawn preset links)
    if (linkLayer && AppUI.showNodeLinks.boolState) {
      if (activeLinks.length) {
        const nodes = Datasets.nodes;
        const labelToNode = new Map();
        nodes.forEach((n) => {
          const idKey = String(n.id);
          if (!labelToNode.has(idKey)) {
            labelToNode.set(idKey, n);
          }
          if (n.displayLabel != null) {
            const lblKey = String(n.displayLabel);
            if (!labelToNode.has(lblKey)) {
              labelToNode.set(lblKey, n);
            }
          }
        });
        const linkData = activeLinks.map((link) => {
          const source = labelToNode.get(String(link.fromLabel));
          const target = labelToNode.get(String(link.toLabel));
          if (!source || !target) return null;
          return {
            key: `${link.fromLabel}->${link.toLabel}`,
            source,
            target,
            color: link.color ?? null,
          };
        }).filter(Boolean);

        const sel = linkLayer.selectAll("line.node-link")
          .data(linkData, (d) => d.key);

          const marginStart = 30; // pixels to inset from start
          const marginEnd = 50; // pixels to inset from end

        sel.join(
          enter => enter.append("line").attr("class", "node-link"),
          update => update,
          exit => exit.remove()
        )
        .attr("x1", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const len = Math.hypot(dx, dy) || 1;
          const m = Math.min(marginStart, len / 2);
          const f = m / len;
          return d.source.x + dx * f;
        })
        .attr("y1", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const len = Math.hypot(dx, dy) || 1;
          const m = Math.min(marginStart, len / 2);
          const f = m / len;
          return d.source.y + dy * f;
        })
        .attr("x2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const len = Math.hypot(dx, dy) || 1;
          const m = Math.min(marginEnd, len / 2);
          const f = (len - m) / len;
          return d.source.x + dx * f;
        })
        .attr("y2", (d) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const len = Math.hypot(dx, dy) || 1;
          const m = Math.min(marginEnd, len / 2);
          const f = (len - m) / len;
          return d.source.y + dy * f;
        })
        .attr("stroke", (d) => d.color ? colourNameForArrowhead(d.color) : "black")
        .attr("stroke-width", 10)
        .attr("marker-end", (d) => "url(#" + (d.color ? getArrowheadId(d.color) : "arrowhead-black") + ")");
      } else {
        linkLayer.selectAll("line.node-link").remove();
      }
    }

    metricsUpdater.updateMetrics(Datasets.nodes, getCurrentSpawnQueue());
}
    
// updateMetrics, handleEnter, handleLeave, summarise moved to js/metrics.js

// ================================================================================================================
// =============== Dragging & Toggling =======================================================================================
// ================================================================================================================
// dragStart, dragging, dragEnd from js/nodeInteraction.js

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
    sel.classed("node-fixed", node.isFixed);
  }
  simulation.alpha(0.5).restart();
}

function toggleFixed(event, d) {
  setNodeFixed(d, !d.isFixed);
}

const metricsUpdater = createMetricsUpdater({
  tbody,
  tfoot,
  scaleUnit,
  hotspotLayer,
  hotspotOpacityOthersOnHover: HOTSPOT_OPACITY_OTHERS_ON_HOVER,
  setNodeFixed,
});

// setupDragAndDropForSpawnButtons, button listeners moved to js/listeners.js
const getExportFilenameBase = (ext) => getExportFilenameBaseFromExporter(ext, { sequenceMode });

// Settings panel: URL params and wiring (see js/settings.js)
const urlParams = new URLSearchParams(window.location.search);
const { applyBackgroundSelection, applyBackgroundOpacity } = createBackgroundAppliers(container);

const sequenceModeRef = { get value() { return sequenceMode; }, set value(v) { sequenceMode = v; } };
setupSettingsPanel({
  container,
  urlParams,
  sequenceModeRef,
  setCollisionEnabled,
  backgroundPresets,
  applyBackgroundSelection,
  applyBackgroundOpacity,
});

const nodeOps = createNodeSpawn({
  nodes: Datasets.nodes,
  activeLinks,
  linkLayer,
  hotspotLayer,
  nodeLayer,
  windLayerCancel,
  windLayerStress,
  windLayerNetForceArrows,
  simulation,
  buildOrUpdateNodes,
  defs,
  width,
  height,
  minDim,
  scaleUnit,
  sequenceModeRef,
});

setupListeners({
  nodeOps,
  clearSpawnQueue,
  updateSettingsURLParam,
  SETTINGS_PARAMS,
  getExportFilenameBase,
  Datasets,
  scaleUnit,
  updateDescriptionPanel,
  activeLinks,
  container,
  svg,
  minDim,
  tbody,
  onResize,
});

/**
 * Show or hide the Description panel based on spawn preset description.
 * Call with a truthy string to show the panel and populate it; call with falsy to hide.
 * @param {string|undefined} description - Optional description text (HTML-safe) from preset.description
 */
export function updateDescriptionPanel(description) {
  const panel = document.getElementById("description-panel");
  const content = document.getElementById("description-content");
  if (!panel || !content) return;
  if (description && String(description).trim()) {
    content.innerHTML = String(description).trim();
    panel.classList.remove("hidden");
  } else {
    content.innerHTML = "";
    panel.classList.add("hidden");
  }
}

// buildSpawnButtonsFromPresets, collapse headers moved to js/listeners.js

// Auto-start a spawn preset from URL (e.g. ?spawn=power-all)
const spawnPresetId = urlParams.get(SETTINGS_PARAMS.spawn);
if (spawnPresetId) {
  const preset = spawnPresets.find((p) => p.id === spawnPresetId);
  if (preset) {
    const nodes = getNodesForPreset(preset);
    if (nodes.length) {
      if (Array.isArray(preset.links) && preset.links.length) {
        activeLinks.push(...preset.links);
      }
      updateDescriptionPanel(preset.description);
      nodeOps.dripSpawnSmart(nodes, 1000).then(async () => {
        // After auto-spawn finishes, read current auto-download state from URL (user may have changed checkboxes during spawn).
        const currentParams = new URLSearchParams(window.location.search);
        const autoSvg = currentParams.get(SETTINGS_PARAMS.autoSvg) === "1";
        const autoPng = currentParams.get(SETTINGS_PARAMS.autoPng) === "1";
        const autoCsv = currentParams.get(SETTINGS_PARAMS.autoCsv) === "1";
        const autoJson = currentParams.get(SETTINGS_PARAMS.autoJson) === "1";
        const exportPromises = [];
        if (autoSvg && typeof window.exportSquareSVG === "function") {
          exportPromises.push(window.exportSquareSVG(getExportFilenameBase("svg")));
        }
        if (autoPng && typeof window.exportSquarePNG === "function") {
          exportPromises.push(window.exportSquarePNG(getExportFilenameBase("png"), 4));
        }
        if (autoCsv && typeof window.exportMetricsCSV === "function") {
          exportPromises.push(Promise.resolve().then(() => window.exportMetricsCSV(getExportFilenameBase("csv"), Datasets.nodes, scaleUnit)));
        }
        if (autoJson && typeof window.exportLayoutJSON === "function") {
          exportPromises.push(Promise.resolve().then(() => window.exportLayoutJSON(getExportFilenameBase("json"), Datasets.nodes, scaleUnit)));
        }
        await Promise.all(exportPromises);

        // Fav queue: after downloads complete, advance to next URL or finish
        try {
          const raw = sessionStorage.getItem("favQueue");
          if (raw) {
            const { urls, index } = JSON.parse(raw);
            const nextIndex = index + 1;
            if (nextIndex < urls.length) {
              sessionStorage.setItem("favQueue", JSON.stringify({ urls, index: nextIndex }));
              window.location.href = urls[nextIndex];
            } else {
              sessionStorage.removeItem("favQueue");
              console.log("✓ Fav queue complete");
            }
          }
        } catch (_) {}
      });
    }
  }
}

// Metrics table, tbody, resize, keydown listeners moved to js/listeners.js
