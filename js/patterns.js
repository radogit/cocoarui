/**
 * SVG pattern definitions (hatch patterns for node fill).
 */

/**
 * Add a diagonal hatch pattern to defs.
 * @param {d3.Selection} patterns - parent <g> for patterns
 * @param {string} id - pattern id (e.g. "diag-hatch")
 * @param {string} stroke - stroke color
 */
export function addDiagHatchPattern(patterns, id, stroke) {
  const p = patterns
    .append("pattern")
    .attr("id", id)
    .attr("width", 6)
    .attr("height", 6)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("patternTransform", "rotate(45)");
  p.append("rect").attr("width", 6).attr("height", 6).attr("fill", "transparent");
  p.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y2", 6)
    .attr("stroke", stroke)
    .attr("stroke-width", 11);
}

/**
 * Add default hatch patterns (diag-hatch, orange, purple variants).
 * @param {d3.Selection} defs - <defs> element
 */
export function addDefaultHatchPatterns(defs) {
  const patterns = defs.append("g").attr("id", "patterns");
  addDiagHatchPattern(patterns, "diag-hatch", "#ff8000");
  addDiagHatchPattern(patterns, "diag-hatch-orange", "#ff8000");
  addDiagHatchPattern(patterns, "diag-hatch-purple", "#900090");
  return patterns;
}
