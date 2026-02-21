/**
 * Viewport / resize handling.
 */

/**
 * Create an onResize handler that scales the SVG container to fit the window.
 * @param {d3.Selection} svg - Root SVG element
 * @param {d3.Selection} container - Inner group to transform
 * @param {number} minDim - Reference dimension for scaling
 * @returns {Function} onResize handler
 */
export function createOnResize(svg, container, minDim) {
  return function onResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    svg.attr("width", newWidth).attr("height", newHeight);

    const scaleFactor = Math.min(newWidth, newHeight) / minDim;
    container.attr("transform",
      `translate(${newWidth / 2}, ${newHeight / 2}) scale(${scaleFactor})`
    );
  };
}
