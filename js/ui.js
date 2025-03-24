// ui.js
export let showNodeLabel = true;
export let showCoordinates = true;
export let showForceArrows = true;
export let showNetForce = true;
export let showNodeLines = true;
export let showObservations = true;
export let showTerminal = false;
export let showBackground = false;

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

showNodeLabel = URLWatchdog(showNodeLabel, 'nodeLabel');
showCoordinates = URLWatchdog(showCoordinates, 'coords');
showForceArrows = URLWatchdog(showForceArrows, 'forceArrows');
showNetForce = URLWatchdog(showNetForce, 'netForceArrows');
showNodeLines = URLWatchdog(showNodeLines, 'obsLines');
showObservations = URLWatchdog(showObservations, 'obs');
showTerminal = URLWatchdog(showTerminal, 'cmd');
showBackground = URLWatchdog(showBackground, 'bg');

/**
 * Checks the URL params for provided terms and adjusts bools as desired
 * @param {Bool} bool 
 * @param {String} param
 */
function URLWatchdog(bool, param, ){
  bool = 
    params.get(param) ? 
    (
      params.get(param)=='true' || params.get(param)==1 ? 
        true 
        : 
        (params.get(param)=='false' || params.get(param)==0 ? false : bool)
    ) 
    : 
    bool;
  return bool;
}

/**
 * Sets up the User Interface
 */
export function setupUI(/* references if needed: svg, etc. */) {
  // enact the above hardcoded choices onto the html file
  document.getElementById("toggleNodeLabel").checked = showNodeLabel;
  document.getElementById("toggleCoordinates").checked = showCoordinates;
  document.getElementById("toggleForceArrows").checked = showForceArrows;
  document.getElementById("toggleNetForce").checked = showNetForce;
  document.getElementById("toggleNodeLines").checked = showNodeLines;
  document.getElementById("toggleObservations").checked = showObservations;
  document.getElementById("toggleTerminal").checked = showTerminal;
    showOrHideElement(showTerminal, "#logContainer", "terminal");
  document.getElementById("toggleBackground").checked = showBackground;
  
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

  const toggleTerminal = document.getElementById("toggleTerminal");
  if (toggleTerminal) {
    toggleTerminal.addEventListener("change", function() {
      showTerminal = this.checked;
      showOrHideElement(showTerminal, "#logContainer", "terminal");
    });
  }
  const toggleBackground = document.getElementById("toggleBackground");
  if (toggleBackground) {
    toggleBackground.addEventListener("change", function() {
      showBackground = this.checked;
      showOrHideElement(showBackground, "#background-layer", "background");
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