/**
 * D3 force simulation setup and collision toggle.
 */
import * as d3 from "d3";
import * as Forces from "./forces.js";

/**
 * Create the force simulation and collision toggle.
 * @param {Array} nodes - Node data array
 * @param {Object} opts
 * @param {number} opts.collisionMargin - Extra space between nodes for collision
 * @returns {{ simulation: d3.Simulation, setCollisionEnabled: Function }}
 */
export function createSimulation(nodes, { collisionMargin }) {
  let collisionEnabled = true;

  const forceCollide = d3.forceCollide().radius(d => d.radius + collisionMargin).strength(1.2);
  const forceRepel = d3.forceManyBody().strength(d => d.isFixed ? 0 : -50);

  const simulation = d3.forceSimulation(nodes)
    .force("travel", Forces.forceTravel(nodes))
    .force("repel", forceRepel)
    .force("collide", forceCollide)
    .force("gaussian", Forces.forceGaussianPreferredArea(1.5, () => collisionEnabled))
    .force("customCollision", Forces.forceCustomCollision);

  function setCollisionEnabled(enabled) {
    collisionEnabled = enabled;
    Forces.nodeNodeCollisionInGaussian = enabled;
    simulation.force("repel", enabled ? forceRepel : null);
    simulation.force("collide", enabled ? forceCollide : null);
    simulation.force("customCollision", enabled ? Forces.forceCustomCollision : null);
    simulation.alpha(0.3).restart();
  }

  return { simulation, setCollisionEnabled };
}
