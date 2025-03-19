// ui.js
export let showNodeLabel = true;
export let showCoordinates = true;
export let showForceArrows = true;
export let showNetForce = true;
export let showNodeLines = true;
export let showObservations = true;

export function setupUI(/* references if needed: svg, etc. */) {
  // enact the above hardcoded choices onto the html file
  document.getElementById("toggleNodeLabel").checked = showNodeLabel;
  document.getElementById("toggleCoordinates").checked = showCoordinates;
  document.getElementById("toggleForceArrows").checked = showForceArrows;
  document.getElementById("toggleNetForce").checked = showNetForce;
  document.getElementById("toggleNodeLines").checked = showNodeLines;
  document.getElementById("toggleObservations").checked = showObservations;

  const toggleNodeLabel = document.getElementById("toggleNodeLabel");
  if (toggleNodeLabel) {
    toggleNodeLabel.addEventListener("change", function() {
      showNodeLabel = this.checked;
      showOrHideElement(showNodeLabel, ".id-label", "ID labels");
    });
  }

  const toggleForceArrowsInput = document.getElementById("toggleForceArrows");
  if (toggleForceArrowsInput) {
    toggleForceArrowsInput.addEventListener("change", function() {
      showForceArrows = this.checked;
      showOrHideElement(showForceArrows, ".force-arrows", "arrows of forces");
    });
  }

  const toggleNetForceInput = document.getElementById("toggleNetForce");
  if (toggleNetForceInput) {
    toggleNetForceInput.addEventListener("change", function() {
      showNetForce = this.checked;
      showOrHideElement(showNetForce, ".force-arrow-netForce", "net force arrows"); // TODODODOODODO
    });
  }

  const toggleCoordinatesInput = document.getElementById("toggleCoordinates");
  if (toggleCoordinatesInput) {
    toggleCoordinatesInput.addEventListener("change", function() {
      showCoordinates = this.checked;
      showOrHideElement(showCoordinates, ".coord-label", "coordinate labels");
    });
  }

  const toggleNodeLinesInput = document.getElementById("toggleNodeLines");
  if (toggleNodeLinesInput) {
    toggleNodeLinesInput.addEventListener("change", function() {
      showNodeLines = this.checked;
      showOrHideElement(showNodeLines, ".node-relations", "dotted lines to observations");
    });
  }

  const toggleObservationsInput = document.getElementById("toggleObservations");
  if (toggleObservationsInput) {
    toggleObservationsInput.addEventListener("change", function() {
      showObservations = this.checked;
      showOrHideElement(showObservations, ".hotspot-group", "observations");
    });
  }

}
/**
 * Find elements in the DOM for which the class is the exact match to the className string, and hides them as desired
 * 
 * @param {Bool} bool 
 * @param {String} className
 * @param {String} shorthand
 */
export function showOrHideElement (bool, className, shorthand) {
  document.querySelectorAll(className).forEach(el => {
    bool ? el.classList.remove("hidden") : el.classList.add("hidden");
  });
  console.log((bool?"show ":"hide ") + shorthand, "yellow");
}