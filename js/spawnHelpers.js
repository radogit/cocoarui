// spawnHelpers.js (or spawnHelpersVisual.js)
import {ensureColourGradient} from './heatmaps.js';
import {buildOrUpdateNodes} from './../script.js';
/* global width, height */   // (declare or pass them in)
// import * as d3 from "d3";

// export function sumAbsoluteForces(node){
//   const arr = node.forces ?? [];
//   return arr.reduce((s,f)=>s+Math.hypot(f.fx,f.fy), 0);
// }

// export async function addNodeWithMultistart(
//   nodes, template, simulation, defs, width, height,
//   k = 6, ticks = 30)
// {
//   let bestStress = Infinity;
//   let bestNode   = null;

//   for (let i = 0; i < k; i++){
//     const cand = structuredClone(template);
//     cand.id += `-try${i}`;
//     cand.x   = (Math.random()-.5)*width;
//     cand.y   = (Math.random()-.5)*height;

//     // ── run a tiny head-less sim ───────────────────────────────
//     const tmpSim = d3.forceSimulation([cand])
//         .force("gaussian", simulation.force("gaussian"))
//         .force("collide" , simulation.force("collide"))
//         .force("repel"   , simulation.force("repel"))
//         .stop();

//     for (let t=0; t<ticks; t++) tmpSim.tick();

//     const stress = sumAbsoluteForces(cand);   // never NaN
//     if (bestNode === null || stress < bestStress){
//       bestStress = stress;
//       bestNode   = cand;
//     }
//   }

//   /* ---------- bestNode is guaranteed to be non-null now ---------- */

//   // remove the “-tryX” suffix so the id is nice:
//   bestNode.id = template.id;

//   // add a gradient *once* for this colour
//   if (defs.select(`#forceGradient-${bestNode.id}`).empty()){
//     const g = defs.append("radialGradient")
//       .attr("id", `forceGradient-${bestNode.id}`)
//       .attr("cx","50%").attr("cy","50%").attr("r","50%");
//     g.append("stop").attr("offset","0%")  .attr("stop-color",bestNode.color).attr("stop-opacity",0.4);
//     g.append("stop").attr("offset","100%").attr("stop-color",bestNode.color).attr("stop-opacity",0.1);
//   }

//   nodes.push(bestNode);                // ← mutate main array
// }




/**
 * Spawn a node by trying k random starts, keep the lowest Σ|F| candidate,
 * and leave every trial breadcrumb in windLayer.
 */
export async function addNodeWithMultistartVisual(
  nodes,            // main data array
  template,         // node blueprint (id, colour, radius, hotspots …)
  simulation,
  width,height,defs,
  windLayer,        // the global <g> we added in §1
  k      = 12,      // number of random trials
  ticks  = 30       // mini-ticks per trial
){
  let bestStress =  Infinity;
  let bestClone  =  null;

  for (let i = 0; i < k; i++) {

    // ---- 1 · clone & randomise position ------------------------------------
    const cand = structuredClone(template);
    cand.x = (Math.random() - .5) * width;
    cand.y = (Math.random() - .5) * height;
    cand.id += `-try${i}`;

    // ---- 2 · make sure its hotspots have a gradient ------------------------
    cand.hotspots.forEach(h => ensureColourGradient(defs, cand.color));

    // ---- 3 · push as a *ghost* and tick a few steps ------------------------
    nodes.push(cand);
    buildOrUpdateNodes(nodeLayer, nodes);
    simulation.nodes(nodes);
    for (let t = 0; t < ticks; t++) simulation.tick();

    // ---- 4 · compute Σ|F| --------------------------------------------------
    const stress = cand.forces.reduce((s, f) => s + Math.hypot(f.fx, f.fy), 0);

    // ---- 5 · breadcrumb in the windLayer ----------------------------------
    windLayer.append("circle")
      .attr("cx", cand.x)
      .attr("cy", cand.y)
      .attr("r", 6)
      .attr("fill", cand.color)
      .attr("fill-opacity", .25)
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .append("title")
      .text(`trial ${i}  Σ|F| = ${stress.toFixed(1)}`);

    // ---- 6 · keep best so far ---------------------------------------------
    if (stress < bestStress) {
      bestStress = stress;
      bestClone  = structuredClone(cand);   // deep copy of the winner
    }

    // ---- 7 · pop ghost -----------------------------------------------------
    nodes.pop();
    nodeLayer.selectAll(".node-group")      // remove its DOM
      .filter(d => d.id === cand.id)
      .remove();
  }

  // ---- 8 · final winner gets real id & stays ------------------------------
  bestClone.id = template.id;
  nodes.push(bestClone);
  buildOrUpdateNodes(nodeLayer, nodes);
  simulation.nodes(nodes).alpha(1).restart();
}


