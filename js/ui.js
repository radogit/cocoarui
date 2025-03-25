// ui.js
export let showNodeLabel = {boolState: true, shorthandString: 'ID labels', ToggleObjectString: 'toggleNodeLabel', DOMObjectString: 'id-label', URLParamString: 'nodeLabel'};
//export let showCoordinates = true;
export let showCoordinates = {boolState: true, shorthandString: 'coordinate labels', ToggleObjectString: 'toggleCoordinates', DOMObjectString: 'coord-label', URLParamString: 'coords'};
//export let showForceArrows = true;
export let showForceArrows = {boolState: true, shorthandString: 'arrows of forces', ToggleObjectString: 'toggleForceArrows', DOMObjectString: 'force-arrows', DOMObjectSingleString: 'force-arrow', URLParamString: 'forceArrows'};
//export let showNetForce = true;
export let showNetForce = {boolState: true, shorthandString: 'net force arrows', ToggleObjectString: 'toggleNetForce', DOMObjectString: 'force-arrow-netForce', URLParamString: 'netForceArrows'};
//export let showNodeLines = true;
export let showNodeLines = {boolState: true, shorthandString: 'dotted lines to observations', ToggleObjectString: 'toggleNodeLines', DOMObjectString: 'node-relations', DOMObjectSingleString: 'node-relation', URLParamString: 'obsLines'};
//export let showObservations = true;
export let showObservations = {boolState: true, shorthandString: 'observations', ToggleObjectString: 'toggleObservations', DOMObjectString: 'hotspot-group', URLParamString: 'obs'};
//export let showTerminal = false;
export let showTerminal = {boolState: false, shorthandString: 'terminal', ToggleObjectString: 'toggleTerminal', DOMObjectString: 'logContainer', URLParamString: 'cmd'};
//export let showBackground = false;
export let showBackground = {boolState: false, shorthandString: 'background', ToggleObjectString: 'toggleBackground', DOMObjectString: 'background-layer', URLParamString: 'bg'};

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

//showNodeLabel = URLWatchdog(showNodeLabel, 'nodeLabel');
showNodeLabel.boolState =     URLWatchdog(showNodeLabel.boolState,    showNodeLabel.URLParamString);
showCoordinates.boolState =   URLWatchdog(showCoordinates.boolState,  showCoordinates.URLParamString);
showForceArrows.boolState =   URLWatchdog(showForceArrows.boolState,  showForceArrows.URLParamString);
showNetForce.boolState =      URLWatchdog(showNetForce.boolState,     showNetForce.URLParamString);
showNodeLines.boolState =     URLWatchdog(showNodeLines.boolState,    showNodeLines.URLParamString);
showObservations.boolState =  URLWatchdog(showObservations.boolState, showObservations.URLParamString);
showTerminal.boolState =      URLWatchdog(showTerminal.boolState,     showTerminal.URLParamString);
showBackground.boolState =    URLWatchdog(showBackground.boolState,   showBackground.URLParamString);

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
  // document.getElementById("toggleNodeLabel").checked = showNodeLabel;
  document.getElementById(showNodeLabel.ToggleObjectString).checked     = showNodeLabel.boolState;
  document.getElementById(showCoordinates.ToggleObjectString).checked   = showCoordinates.boolState;
  document.getElementById(showForceArrows.ToggleObjectString).checked   = showForceArrows.boolState;
  document.getElementById(showNetForce.ToggleObjectString).checked      = showNetForce.boolState;
  document.getElementById(showNodeLines.ToggleObjectString).checked     = showNodeLines.boolState;
  document.getElementById(showObservations.ToggleObjectString).checked  = showObservations.boolState;
  document.getElementById(showTerminal.ToggleObjectString).checked      = showTerminal.boolState;
    showOrHideElement(showTerminal.boolState, "#logContainer", "terminal");
  document.getElementById(showBackground.ToggleObjectString).checked    = showBackground.boolState;
  
  const toggleNodeLabel = document.getElementById(showNodeLabel.ToggleObjectString);
  if (toggleNodeLabel) {
    toggleNodeLabel.addEventListener("change", function() {
      showNodeLabel.boolState = this.checked;
      showOrHideElement(showNodeLabel.boolState, "."+showNodeLabel.DOMObjectString, showNodeLabel.shorthandString, showNodeLabel.URLParamString);
    });
  }

  const toggleForceArrowsInput = document.getElementById(showForceArrows.ToggleObjectString);
  if (toggleForceArrowsInput) {
    toggleForceArrowsInput.addEventListener("change", function() {
      showForceArrows.boolState = this.checked;
      showOrHideElement(showForceArrows.boolState, "."+showForceArrows.DOMObjectString, showForceArrows.shorthandString, showForceArrows.URLParamString);
    });
  }

  const toggleNetForceInput = document.getElementById(showNetForce.ToggleObjectString);
  if (toggleNetForceInput) {
    toggleNetForceInput.addEventListener("change", function() {
      showNetForce.boolState = this.checked;
      showOrHideElement(showNetForce.boolState, "."+showNetForce.DOMObjectString, showNetForce.shorthandString, showNetForce.URLParamString);
    });
  }

  const toggleCoordinatesInput = document.getElementById(showCoordinates.ToggleObjectString);
  if (toggleCoordinatesInput) {
    toggleCoordinatesInput.addEventListener("change", function() {
      showCoordinates.boolState = this.checked;
      showOrHideElement(showCoordinates.boolState, "."+showCoordinates.DOMObjectString, showCoordinates.shorthandString, showCoordinates.URLParamString);
    });
  }

  const toggleNodeLinesInput = document.getElementById(showNodeLines.ToggleObjectString);
  if (toggleNodeLinesInput) {
    toggleNodeLinesInput.addEventListener("change", function() {
      showNodeLines.boolState = this.checked;
      showOrHideElement(showNodeLines.boolState, "."+showNodeLines.DOMObjectString, showNodeLines.shorthandString, showNodeLines.URLParamString);
    });
  }

  const toggleObservationsInput = document.getElementById(showObservations.ToggleObjectString);
  if (toggleObservationsInput) {
    toggleObservationsInput.addEventListener("change", function() {
      showObservations.boolState = this.checked;
      showOrHideElement(showObservations.boolState, "."+showObservations.DOMObjectString, showObservations.shorthandString, showObservations.URLParamString);
    });
  }

  const toggleTerminal = document.getElementById(showTerminal.ToggleObjectString);
  if (toggleTerminal) {
    toggleTerminal.addEventListener("change", function() {
      showTerminal.boolState = this.checked;
      showOrHideElement(showTerminal.boolState, "#"+showTerminal.DOMObjectString, showTerminal.shorthandString, showTerminal.URLParamString);
    });
  }
  const toggleBackground = document.getElementById(showBackground.ToggleObjectString);
  if (toggleBackground) {
    toggleBackground.addEventListener("change", function() {
      showBackground.boolState = this.checked;
      showOrHideElement(showBackground.boolState, "#"+showBackground.DOMObjectString, showBackground.shorthandString, showBackground.URLParamString);
    });
  }



}

/**
 * Find elements in the DOM for which the class is the exact match to the className string, and hides them as desired
 * 
 * @param {Bool} bool 
 * @param {String} className
 * @param {String} shorthand
 * @param {String} URLparam
 */
export function showOrHideElement (bool, className, shorthand, URLparam) {
  document.querySelectorAll(className).forEach(el => {
    bool ? el.classList.remove("hidden") : el.classList.add("hidden");
  });
  // Also reflect new state in the URL
  updateURLParam(URLparam, bool);

  console.log((bool?"show ":"hide ") + shorthand, "yellow");
}

/**
 * Sets or deletes a param in the URL, 
 * then updates the browser’s address bar without reloading.
 *
 * @param {String} param - the parameter name, e.g. "coords"
 * @param {Boolean} bool - the new state
 */
function updateURLParam(param, bool) {
  const url = new URL(window.location);
  // If we want to reflect the checkbox being "true" or "false"
  // you can do:
  url.searchParams.set(param, bool ? "true" : "false");
  
  // If you prefer removing the param when false, you can do:
  // if (bool) {
  //   url.searchParams.set(param, "true");
  // } else {
  //   url.searchParams.delete(param);
  // }
  
  // Update the browser's URL bar 
  // but don’t reload or add a new history entry:
  window.history.replaceState({}, "", url);
}
