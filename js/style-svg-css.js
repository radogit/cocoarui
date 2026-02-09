/**
 * Bundled copy of style-svg.css for embedding into exported SVG when fetch fails
 * (e.g. production build where style-svg.css is bundled or SPA returns index.html).
 * Keep in sync with style-svg.css when changing SVG styles.
 */
export const STYLE_SVG_CSS = `/* SVG-only styles: used in-document and embedded into exported SVG */

svg {
  font-family: Arial, sans-serif;
}

.label {
  pointer-events: none;
  user-select: none;
  font-size: 10px;
  fill: rgba(0, 0, 0, 0.2);
}

.id-label,
.coord-label,
.graph-label {
  font-size: 15px;
  font-weight: bolder;
  opacity: 1;
  text-anchor: middle;
}

.id-label {
  fill: white;
  text-shadow:
    0 0 0 #000,
    1px 0 0 #000,
    -1px 0 0 #000,
    0 1px 0 #000,
    0 -1px 0 #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    2px 2px 0 #000,
    3px 3px 0 #000;
  paint-order: stroke fill markers;
}

.force-arrows,
.node-relations,
.coord-label,
.id-label,
.hotspot-group {
  transition: opacity 0.5s ease;
}

.node-circle.hidden {
  pointer-events: initial !important;
  user-select: initial !important;
}

.highlight-circle {
  stroke-dasharray: 12 6;
  stroke-width: 5px;
  stroke: black;
}

.haloSpin {
  animation: spinDash 4s linear infinite;
}

@keyframes spinDash {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.force-arrow { filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4)); }
`;
