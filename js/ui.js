// ui.js
export let showNodeLabel =            { keyboardShortcut: 'Digit1', keyboardShortcutLetter: '1', defaultState: true, boolState: true, UILabelString: 'ID Label', shorthandString: 'ID labels', ToggleObjectString: 'toggleNodeLabel', DOMObjectString: 'id-label', URLParamString: 'nodeLabel'};
export let showCoordinates =          { keyboardShortcut: 'Digit2', keyboardShortcutLetter: '2', defaultState: true, boolState: true, UILabelString: 'Coordinates', shorthandString: 'coordinate labels', ToggleObjectString: 'toggleCoordinates', DOMObjectString: 'coord-label', URLParamString: 'coords'};
export let showForceArrows =          { keyboardShortcut: 'Digit3', keyboardShortcutLetter: '3', defaultState: true, boolState: true, UILabelString: 'Force Arrows', shorthandString: 'arrows of forces', ToggleObjectString: 'toggleForceArrows', DOMObjectString: 'force-arrows', DOMObjectSingleString: 'force-arrow', URLParamString: 'forceArrows'};
export let showNetForce =             { keyboardShortcut: 'Digit4', keyboardShortcutLetter: '4', defaultState: true, boolState: true, UILabelString: 'Net Force', shorthandString: 'net force arrows', ToggleObjectString: 'toggleNetForce', DOMObjectString: 'force-arrow-netForce', URLParamString: 'netForceArrows'};
export let showObservations =         { keyboardShortcut: 'Digit5', keyboardShortcutLetter: '5', defaultState: true, boolState: true, UILabelString: 'Observations', shorthandString: 'observations', ToggleObjectString: 'toggleObservations', DOMObjectString: 'hotspot-group', URLParamString: 'obs'};
export let showNodeLines =            { keyboardShortcut: 'Digit6', keyboardShortcutLetter: '6', defaultState: true, boolState: true, UILabelString: 'Obs. Lines', shorthandString: 'dotted lines to observations', ToggleObjectString: 'toggleNodeLines', DOMObjectString: 'node-relations', DOMObjectSingleString: 'node-relation', URLParamString: 'obsLines'};
export let showBackground =           { keyboardShortcut: 'Digit7', keyboardShortcutLetter: '7', defaultState: false, boolState: false, UILabelString: 'Background', shorthandString: 'background', ToggleObjectString: 'toggleBackground', DOMObjectString: 'background-layer', URLParamString: 'bg'};
export let showWindStress =           { keyboardShortcut: 'Digit8', keyboardShortcutLetter: '8', defaultState: true, boolState: true, UILabelString: 'Wind Stress', shorthandString: 'wind stress', ToggleObjectString: 'windStress', DOMObjectString: 'wind-layer-stress', URLParamString: 'windStress'};
export let showWindCancel =           { keyboardShortcut: 'Digit9', keyboardShortcutLetter: '9', defaultState: true, boolState: true, UILabelString: 'Wind Cancel', shorthandString: 'wind cancel', ToggleObjectString: 'windCancel', DOMObjectString: 'wind-layer-cancel', URLParamString: 'windCancel'};
export let showWindNetForceArrows =   { keyboardShortcut: 'Digit0', keyboardShortcutLetter: '0', defaultState: true, boolState: true, UILabelString: 'Wind Net Force', shorthandString: 'wind net force', ToggleObjectString: 'windNetForce', DOMObjectString: 'wind-layer-netForceArrow', URLParamString: 'windNetForce'};
export let showTerminal =             { keyboardShortcut: 'KeyL',   keyboardShortcutLetter: 'L', defaultState: false, boolState: false, UILabelString: 'Log', shorthandString: 'terminal', ToggleObjectString: 'toggleTerminal', DOMObjectString: 'logContainer', URLParamString: 'cmd'};

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const showSettings = [
  showNodeLabel,
  showCoordinates,
  showForceArrows,
  showNetForce,
  showObservations,
  showNodeLines,
  showBackground,
  showWindStress,
  showWindCancel,
  showWindNetForceArrows,
  showTerminal
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
  const UIContainer = document.getElementById("UIContainer");
  
  showSettings.forEach((setting, index) => {
    // check URL params
    setting.boolState = URLWatchdog(setting.defaultState, setting.URLParamString);
    // create a checkbox in UI
    const UIElement = document.createElement("label");
    let UIElementInput = document.createElement("input");
    UIElementInput.id = setting.ToggleObjectString;
    UIElementInput.type = "checkbox";
    UIElementInput.setAttribute("keyboardShortcut", setting.keyboardShortcut);
    UIElement.appendChild(UIElementInput);
    //UIElement.appendChild(document.createTextNode(' [ ' + (index+1) + ' ] ' + setting.UILabelString));
    const span = document.createElement("span");
    span.textContent = ' [ ' + setting.keyboardShortcutLetter + ' ] ' + setting.UILabelString;
    UIElement.appendChild(span);
    UIContainer.appendChild(UIElement);
    // update the checkbox in UI
    document.getElementById(setting.ToggleObjectString).checked = setting.boolState;

    // enact the state in the UI
    showOrHideElement(setting.boolState, "." + setting.DOMObjectString, setting.shorthandString, setting.URLParamString, setting.defaultState);

    // add a listener to the checkbox to update UI and URL param
    const toggleInput = document.getElementById(setting.ToggleObjectString);
    if (toggleInput) {
        toggleInput.addEventListener("change", function() {
            setting.boolState = this.checked;
            showOrHideElement(setting.boolState, "." + setting.DOMObjectString, setting.shorthandString, setting.URLParamString, setting.defaultState);
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
export function showOrHideElement (bool, className, shorthand, URLparam, defaultState) {
  document.querySelectorAll(className).forEach(el => {
    bool ? el.classList.remove("hidden") : el.classList.add("hidden");
  });
  // Also reflect new state in the URL
  updateURLParam(URLparam, bool, defaultState);

  console.log((bool ? "show " : "hide ") + shorthand, "yellow");
}

/**
 * Sets or deletes a param in the URL, then updates the browser’s address bar without reloading
 * @param {String} param - the parameter name, e.g. "coords"
 * @param {Boolean} bool - the new state
 */
function updateURLParam(param, bool, defaultState) {
  const url = new URL(window.location);
  //url.searchParams.set(param, bool ? "1" : "0");
  
  //If you prefer removing the param when false, you can do:
  if (bool != defaultState) {
    url.searchParams.set(param, bool ? "1" : "0");
  } else {
    url.searchParams.delete(param);
  }
  
  // Update the browser's URL bar but don’t reload or add a new history entry:
  window.history.replaceState({}, "", url);
}
