// ui.js
export let showNodeLabel =    { boolState: true, shorthandString: 'ID labels', ToggleObjectString: 'toggleNodeLabel', DOMObjectString: 'id-label', URLParamString: 'nodeLabel'};
export let showCoordinates =  { boolState: true, shorthandString: 'coordinate labels', ToggleObjectString: 'toggleCoordinates', DOMObjectString: 'coord-label', URLParamString: 'coords'};
export let showForceArrows =  { boolState: true, shorthandString: 'arrows of forces', ToggleObjectString: 'toggleForceArrows', DOMObjectString: 'force-arrows', DOMObjectSingleString: 'force-arrow', URLParamString: 'forceArrows'};
export let showNetForce =     { boolState: true, shorthandString: 'net force arrows', ToggleObjectString: 'toggleNetForce', DOMObjectString: 'force-arrow-netForce', URLParamString: 'netForceArrows'};
export let showNodeLines =    { boolState: true, shorthandString: 'dotted lines to observations', ToggleObjectString: 'toggleNodeLines', DOMObjectString: 'node-relations', DOMObjectSingleString: 'node-relation', URLParamString: 'obsLines'};
export let showObservations = { boolState: true, shorthandString: 'observations', ToggleObjectString: 'toggleObservations', DOMObjectString: 'hotspot-group', URLParamString: 'obs'};
export let showTerminal =     { boolState: false, shorthandString: 'terminal', ToggleObjectString: 'toggleTerminal', DOMObjectString: 'logContainer', URLParamString: 'cmd'};
export let showBackground =   { boolState: false, shorthandString: 'background', ToggleObjectString: 'toggleBackground', DOMObjectString: 'background-layer', URLParamString: 'bg'};

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const showSettings = [
  showNodeLabel,
  showCoordinates,
  showForceArrows,
  showNetForce,
  showNodeLines,
  showObservations,
  showTerminal,
  showBackground
];

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

  showSettings.forEach(setting => {
    // check URL params
    setting.boolState = URLWatchdog(setting.boolState, setting.URLParamString);
    // update the checkbox in UI
    document.getElementById(setting.ToggleObjectString).checked = setting.boolState;

    // add a listener to the checkbox to update UI and URL param
    const toggleInput = document.getElementById(setting.ToggleObjectString);
    if (toggleInput) {
        toggleInput.addEventListener("change", function() {
            setting.boolState = this.checked;
            showOrHideElement(setting.boolState, "." + setting.DOMObjectString, setting.shorthandString, setting.URLParamString);
        });
    }
  });

}

/**
 * Find elements in the DOM for which the class is the exact match to the className string, and hides them as desired
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

  console.log((bool ? "show " : "hide ") + shorthand, "yellow");
}

/**
 * Sets or deletes a param in the URL, then updates the browser’s address bar without reloading
 * @param {String} param - the parameter name, e.g. "coords"
 * @param {Boolean} bool - the new state
 */
function updateURLParam(param, bool) {
  const url = new URL(window.location);
  url.searchParams.set(param, bool ? "1" : "0");
  
  // If you prefer removing the param when false, you can do:
  // if (bool) {
  //   url.searchParams.set(param, "true");
  // } else {
  //   url.searchParams.delete(param);
  // }
  
  // Update the browser's URL bar but don’t reload or add a new history entry:
  window.history.replaceState({}, "", url);
}
