// forces.js
import { collisionMargin, nodes } from "./data.js";

// Gaussian force for hotspots
export function forceGaussianPreferredArea(strength) {
  return function(alpha) {
    nodes.forEach(d => {
      d.forces = []; // Reset all force vectors for this tick

      // Hotspot logic
      d.hotspots.forEach(hotspot => {
        const dx = hotspot.x - d.x;
        const dy = hotspot.y - d.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance > 1) {
          const f = Math.exp(-distance / hotspot.width) * strength * hotspot.intensityFactor;
          const fx = (hotspot.forceType === "attract") ? dx*f : -dx*f;
          const fy = (hotspot.forceType === "attract") ? dy*f : -dy*f;

          d.vx += fx * alpha;
          d.vy += fy * alpha;
          d.forces.push({ fx, fy, source: "hotspot" });
        }
      });

      // Node-to-node collision (soft approach)
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

// Weighted collision
export function forceCustomCollision(alpha) {
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
