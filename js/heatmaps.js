import * as d3 from "d3";
import {showObservations} from "./ui.js";

/**
 * Creates radial gradients for each node in `nodes`.
 * @param {d3.Selection} defs 
 * @param {Array} nodes The array of node objects with .id and .color.
 * @param {Array} colours The array of colours
 */
export function createHeatmapGradients(defs, nodes, colours) {

    const heatmapGradientContainer = defs.append("g").attr("id","heatmapGradients").attr("width",100).attr("height",100);

    // Define gradients for each node's hotspots dynamically
    colours.forEach(colour => {
        // Create a unique radial gradient for each node's hotspots
        const gradient = heatmapGradientContainer.append("radialGradient")
            .attr("id", `forceGradient-${colour}`)
            .attr("width", 100)
            .attr("height", 100)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");
    
        gradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", colour)  // Use node's color for the center
            .style("stop-opacity", 0.4);
    
        gradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", colour)
            .style("stop-opacity", 0.1);
    });
}

/**
 * Format observation name for hotspot label: VR-style ids → "VR.088.7"; others → "PP." + name.
 */
function formatHotspotName(name) {
  if (name == null) return "";
  const s = String(name);
  const prefix = "rado-Simple Interactable(Clone)-";
  if (!s.startsWith(prefix)) return "PP." + s;
  const rest = s.slice(prefix.length);
  const parts = rest.split("-");
  const firstSegment = parts[0] ?? "";
  const participantMatch = rest.match(/participant(\d+)/i);
  const participantNum = participantMatch ? String(participantMatch[1]).padStart(3, "0") : "???";
  return `VR.${participantNum}.${firstSegment}`;
}

/**
 * Format effective impact (intensityFactor/divisor) for display on hotspot.
 * divisor === 1: show number only, no brackets; integer without decimals.
 * Otherwise: "value (a/b)" e.g. "0.22 (2/11)"; integer value without decimals.
 */
function formatHotspotImpact(intensityFactor, divisor) {
  const ifactor = intensityFactor ?? 1;
  if (divisor === 0) return "0";
  const impact = divisor === 1 ? ifactor : ifactor / divisor;
  if (divisor === 1) return Number.isInteger(impact) ? String(impact) : String(impact);
  const frac = `${ifactor}/${divisor}`;
  return Number.isInteger(impact) ? `${impact} (${frac})` : `${impact.toFixed(2)} (${frac})`;
}

/**
 * Builds hotspot rectangles for each node, placing them in a `<g.hotspot-group>` 
 * with `<rect>` elements inside that group.
 * Each rect gets two labels: top-left = observation name, bottom-right = impact (intensityFactor/divisor).
 * 
 * @param {d3.Selection} container The main <g> container for your simulation.
 * @param {Array} nodes The array of node objects, each with .hotspots array
 * @param {d3.Selection} defs The main <g> container for your simulation.
 */
export function buildHeatspotRects(container, nodes, defs){

    // Create hotspot rectangles for each node
    const hotspotGroups = container.selectAll("."+showObservations.DOMObjectString)
        .data(nodes, d => d.id)
        .join("g")
        .attr("class", showObservations.boolState ? showObservations.DOMObjectString : showObservations.DOMObjectString+" hidden")
        .attr("id", d => showObservations.DOMObjectString + "-" + d.id)
        .attr("opacity",0.3)
        ;
    
    hotspotGroups.selectAll(".hotspot")
        .data(d => d.hotspots)
        .join(
            // ========== Enter logic for new rects ==========
            enter => {
              // Create newly entered <rect> elements
              const r = enter.append("rect")
                .attr("class", "hotspot");
      
              // Log a message for each newly entered rect
              r.each(function(h) {
                const nodeData = d3.select(this.parentNode).datum(); 
                // (the node that owns these hotspots)
                //console.log(`New hotspot for node '${nodeData.id}' — size: ${h.width.toFixed(0)}x${h.height.toFixed(0)}, position: (${h.x.toFixed(0)}, ${h.y.toFixed(0)})`);
              });
      
              // Return the newly created selection so D3 can handle update logic
              return r;
            },
            // ========== Update logic (optional) ==========
            update => update,
            // ========== Exit logic ==========
            exit => exit.remove()
          )
        .attr("x", d => d.x - d.width / 2)
        .attr("y", d => d.y - d.height / 2)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .each(function(d) {
            // Ensure each hotspot references the correct node ID dynamically
            d.nodeId = d3.select(this.parentNode).datum().id;
            d.color = d3.select(this.parentNode).datum().color;
        })
        //.attr("fill", d => `url(#forceGradient-${d.color})`)  // Correctly associate hotspot with node's gradient
        .attr("fill", d => ensureColourGradient(defs, d.color))  // Correctly associate hotspot with node's gradient
        .style("stroke", d=>d.color)        // Thin black border
        .style("stroke-width", 2)        // Border thickness
    ;

    const labelInset = 2;
    // Top-left: observation name (e.g. "387.6"); fill = node color (same as rect border)
    hotspotGroups.selectAll("text.hotspot-label-name")
        .data(d => d.hotspots)
        .join("text")
        .attr("class", "hotspot-label-name")
        .attr("x", d => d.x - d.width / 2 + labelInset)
        .attr("y", d => d.y - d.height / 2 + labelInset)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "hanging")
        .style("pointer-events", "none")
        .style("font-size", "10px")
        .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().color)
        .text(d => formatHotspotName(d.name));

    // Bottom-right: impact = intensityFactor/divisor (e.g. "0.22 (2/11)" or "1"); fill = node color
    hotspotGroups.selectAll("text.hotspot-label-impact")
        .data(d => d.hotspots)
        .join("text")
        .attr("class", "hotspot-label-impact")
        .attr("x", d => d.x + d.width / 2 - labelInset)
        .attr("y", d => d.y + d.height / 2 - labelInset)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "auto")
        .style("pointer-events", "none")
        .style("font-size", "10px")
        .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().color)
        .text((d, i, nodes) => {
            const node = d3.select(nodes[i].parentNode).datum();
            const divisor = (node.hotspotForceDivisor && node.hotspotForceDivisor[d.name]) ?? 1;
            return formatHotspotImpact(d.intensityFactor, divisor);
        });
}

/**
 * Builds hotspot rectangles for each node, placing them in a `<g.hotspot-group>` 
 * with `<rect>` elements inside that group.
 * 
 * @param {d3.Selection} defs 
 * @param {} color 
 */
export function ensureColourGradient(defs, color) {
  const id = `forceGradient-${color.replace('#','')}`;
  if (defs.select(`#${id}`).empty()) {
    const g = defs.append("radialGradient")
      .attr("id", id)
      .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
    g.append("stop").attr("offset", "0%")  .style("stop-color", color).style("stop-opacity", .4);
    g.append("stop").attr("offset", "100%").style("stop-color", color).style("stop-opacity", .1);
  }
  return `url(#${id})`;
}