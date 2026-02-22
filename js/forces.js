import { collisionMargin, nodes } from "./datasets.js";

/** When false, the node-to-node collision block inside forceGaussianPreferredArea is skipped. Set from script when collision setting is off. */
export let nodeNodeCollisionInGaussian = true;

/**
 * Gaussian force for hotspots. Optional second arg: getNodeNodeCollisionEnabled() – if provided and returns false, node-to-node push is skipped.
 */
export function forceGaussianPreferredArea(strength, getNodeNodeCollisionEnabled) {
  return function(alpha) {
    const runNodeNodeCollision = getNodeNodeCollisionEnabled ? getNodeNodeCollisionEnabled() : nodeNodeCollisionInGaussian;
    nodes.forEach(d => {
      d.forces = []; // Reset all force vectors for this tick

      // Hotspot logic
      d.hotspots.forEach(hotspot => {
        const dx = hotspot.x - d.x;
        const dy = hotspot.y - d.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 1) {
          const divisor = (d.hotspotForceDivisor?.[hotspot.name] ?? 1);
          const f = (Math.exp(-distance / hotspot.width) * strength * hotspot.intensityFactor) / divisor;
          const fx = (hotspot.forceType === "attract") ? dx*f : -dx*f;
          const fy = (hotspot.forceType === "attract") ? dy*f : -dy*f;

          d.vx += fx * alpha;
          d.vy += fy * alpha;
          d.forces.push({ fx, fy, source: "hotspot" });
        }
      });

      // Node-to-node collision (soft approach) – skipped when collision setting is off
      if (!runNodeNodeCollision) return;
      nodes.forEach(other => {
        if (d === other) return;
        const dx = other.x - d.x;
        const dy = other.y - d.y;
        const dist= Math.sqrt(dx*dx + dy*dy);
        const minDist= d.radius + other.radius + collisionMargin;
        if (dist<minDist) {
          const overlapRatio = 1 - dist/minDist;
          const pushVal = (overlapRatio**2)* alpha* 5;
          const pushX= (dx/dist)*(minDist-dist);
          const pushY= (dy/dist)*(minDist-dist);

          d.vx -= pushX* alpha* 0.5;
          d.vy -= pushY* alpha* 0.5;

          d.forces.push({ fx:-pushX, fy:-pushY, source: `collision with ${other.id}` });
        }
      });
    });
  };
}

// Weighted collision. No-ops when nodeNodeCollisionInGaussian is false (collision setting off).
export function forceCustomCollision(alpha) {
  if (!nodeNodeCollisionInGaussian) return;
  nodes.forEach((d,i) => {
    nodes.forEach((other,j) => {
      if (i===j) return;
      const dx = d.x - other.x;
      const dy = d.y - other.y;
      const dist= Math.sqrt(dx*dx + dy*dy);
      const minDist= d.radius+ other.radius+ collisionMargin;
      if (dist<minDist && dist>0) {
        const overlap=1 - dist/minDist;
        const f= (overlap**2)* alpha* 5;
        const pushX= (dx/dist)*f;
        const pushY= (dy/dist)*f;

        if (!d.isFixed && !other.isFixed) {
          const w1= d.significance||1, w2= other.significance||1;
          const tw= w1+w2;
          const dWeight= w2/tw, otherWeight= w1/tw;
          d.vx+= pushX*dWeight; d.vy+= pushY*dWeight;
          other.vx-= pushX*otherWeight; other.vy-= pushY*otherWeight;
        } else if (!d.isFixed) {
          d.vx+= pushX; d.vy+= pushY;
        } else if (!other.isFixed) {
          other.vx-= pushX; other.vy-= pushY;
        }
        d.forces.push({ fx:-pushX, fy:-pushY, source:`collision with ${other.id}` });
      }
    });
  });
}

export function forceTravel(nodes) {
  let lastMs = performance.now();        // ← local clock

  function force() {
    const now   = performance.now();
    const dtSec = (now - lastMs) / 1000; // seconds since last tick
    lastMs      = now;

    nodes.forEach(n => {
      if (n.travelMode !== 'line' || n.travelDone) return;

      /* vector & remaining distance */
      const dx = n.travelTo.x - n.travelFrom.x;
      const dy = n.travelTo.y - n.travelFrom.y;
      const   L = Math.hypot(dx, dy);
      if (L === 0) { n.travelDone = true; return; }

      /* progress this tick */
      const v  = n.travelSpeed;              // units / s
      const dL = v * dtSec;                  // advance along the path
      n.travelDist = (n.travelDist ?? 0) + dL;

      if (n.travelDist >= L) {               // reached (or overshot) end
        n.x = n.fx = n.travelTo.x;
        n.y = n.fy = n.travelTo.y;
        n.vx = n.vy = 0;
        n.radius = n.radiusFinal; 
        n.travelDone = true;                 // <- no more updates
      } else {
        const frac = n.travelDist / L;       // 0 … <1
        n.x = n.fx = n.travelFrom.x + frac * dx;
        n.y = n.fy = n.travelFrom.y + frac * dy;
        n.radius = n.radiusFinal * frac;
      }
    });
  }
  force.initialize = _ => (nodes = _);
  return force;
}
