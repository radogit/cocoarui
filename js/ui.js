// ui.js
// filenameStringOn / filenameStringOff: string to include in export filename when checkbox is on/off; empty = skip.
export let showNodeLabel =            { keyboardShortcut: 'Digit1',   keyboardShortcutLetter: '1',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Name', shorthandString: 'ID labels', ToggleObjectString: 'toggleNodeLabel', DOMObjectString: 'id-label', URLParamString: 'nodeLabel', filenameStringOn: 'name', filenameStringOff: ''};
export let showCoordinates =          { keyboardShortcut: 'Digit2',   keyboardShortcutLetter: '2',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Coordinates', shorthandString: 'coordinate labels', ToggleObjectString: 'toggleCoordinates', DOMObjectString: 'coord-label', URLParamString: 'coords', filenameStringOn: 'coords', filenameStringOff: ''};
export let showForceArrows =          { keyboardShortcut: 'Digit3',   keyboardShortcutLetter: '3',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Force Arrows', shorthandString: 'arrows of forces', ToggleObjectString: 'toggleForceArrows', DOMObjectString: 'force-arrows', DOMObjectSingleString: 'force-arrow', URLParamString: 'forceArrows', filenameStringOn: 'farrows', filenameStringOff: ''};
export let showForceArrowsLabels =    { keyboardShortcut: 'KeyE',     keyboardShortcutLetter: 'E',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Force Label', shorthandString: 'labels for arrows of forces', ToggleObjectString: 'toggleForceArrowsLabels', DOMObjectString: 'force-arrows-labels', DOMObjectSingleString: 'force-arrow-labels', URLParamString: 'forceArrowsLabels', filenameStringOn: 'flabels', filenameStringOff: ''};
export let showNetForce =             { keyboardShortcut: 'KeyN',     keyboardShortcutLetter: 'N',  shownInViewPanel: false, defaultState: true, boolState: true, UILabelString: 'Net Force', shorthandString: 'net force arrows', ToggleObjectString: 'toggleNetForce', DOMObjectString: 'force-arrow-netForce', URLParamString: 'netForceArrows', filenameStringOn: '', filenameStringOff: ''};
export let showObservations =         { keyboardShortcut: 'Digit4',   keyboardShortcutLetter: '4',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Observations', shorthandString: 'observations', ToggleObjectString: 'toggleObservations', DOMObjectString: 'hotspot-group', URLParamString: 'obs', filenameStringOn: 'obs', filenameStringOff: ''};
export let showNodeLines =            { keyboardShortcut: 'Digit5',   keyboardShortcutLetter: '5',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Breadcrumbs', shorthandString: 'dotted lines to observations', ToggleObjectString: 'toggleNodeLines', DOMObjectString: 'node-relations', DOMObjectSingleString: 'node-relation', URLParamString: 'obsLines', filenameStringOn: 'brdcr', filenameStringOff: ''};
export let showBackground =           { keyboardShortcut: 'Digit6',   keyboardShortcutLetter: '6',  shownInViewPanel: true, defaultState: true, boolState: false, UILabelString: 'Background', shorthandString: 'background', ToggleObjectString: 'toggleBackground', DOMObjectString: 'background-layer', URLParamString: 'bg', filenameStringOn: '__bg__', filenameStringOff: ''};
export let showWindStress =           { keyboardShortcut: 'Digit7',   keyboardShortcutLetter: '7',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Stress Heatmap', shorthandString: 'stress heatmap', ToggleObjectString: 'stressHeatmap', DOMObjectString: 'wind-layer-stress', URLParamString: 'stressHeatmap', filenameStringOn: 'stress', filenameStringOff: ''};
export let showWindStressLabel =      { keyboardShortcut: 'KeyB',     keyboardShortcutLetter: 'B',  shownInViewPanel: false, defaultState: true, boolState: true, UILabelString: 'Stress Heatmap Label', shorthandString: 'stress heatmap label', ToggleObjectString: 'stressHeatmapLabel', DOMObjectString: 'wind-layer-stress-label', URLParamString: 'stressHeatmapLabel', filenameStringOn: '', filenameStringOff: ''};
export let showWindCancel =           { keyboardShortcut: 'KeyW',     keyboardShortcutLetter: 'W',  shownInViewPanel: false, defaultState: false, boolState: false, UILabelString: 'Wind Cancel', shorthandString: 'wind cancel', ToggleObjectString: 'windCancel', DOMObjectString: 'wind-layer-cancel', URLParamString: 'windCancel', filenameStringOn: '', filenameStringOff: ''};
export let showWindCancelLabel =      { keyboardShortcut: 'KeyJ',     keyboardShortcutLetter: 'J',  shownInViewPanel: false, defaultState: false, boolState: false, UILabelString: 'Wind Cancel Label', shorthandString: 'wind cancel label', ToggleObjectString: 'windCancelLabel', DOMObjectString: 'wind-layer-cancel-label', URLParamString: 'windCancelLabel', filenameStringOn: '', filenameStringOff: ''};
export let showWindNetForceArrows =   { keyboardShortcut: 'Digit8',   keyboardShortcutLetter: '8',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Wind Map', shorthandString: 'wind net force', ToggleObjectString: 'windNetForce', DOMObjectString: 'wind-layer-netForceArrow', URLParamString: 'windNetForce', filenameStringOn: 'wind', filenameStringOff: ''};
export let showCircles =              { keyboardShortcut: 'Digit9',   keyboardShortcutLetter: '9',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Node Circles', shorthandString: 'node circles', ToggleObjectString: 'nodeCircles', DOMObjectString: 'node-circle', URLParamString: 'nodeCircles', filenameStringOn: 'circ', filenameStringOff: 'nocirc'};
export let showNodeIcon =             { keyboardShortcut: 'Digit0',   keyboardShortcutLetter: '0',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Node Icon', shorthandString: 'node icon', ToggleObjectString: 'toggleNodeIcon', DOMObjectString: 'node-icon', URLParamString: 'nodeIcon', filenameStringOn: 'icon', filenameStringOff: 'noicon'};
export let showNodeLinks =            { keyboardShortcut: 'KeyK',    keyboardShortcutLetter: 'K',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Node Links', shorthandString: 'node links', ToggleObjectString: 'toggleNodeLinks', DOMObjectString: 'node-links', URLParamString: 'nodeLinks', filenameStringOn: '', filenameStringOff: ''};
export let showAxis =                 { keyboardShortcut: 'KeyA',     keyboardShortcutLetter: 'A',  shownInViewPanel: true, defaultState: false, boolState: true, UILabelString: 'Axis', shorthandString: 'axis', ToggleObjectString: 'toggleAxis', DOMObjectString: 'axis', URLParamString: 'axis', filenameStringOn: 'axis', filenameStringOff: ''};
export let showVerticalGrid =        { keyboardShortcut: 'KeyG',     keyboardShortcutLetter: 'G',  shownInViewPanel: true, defaultState: false, boolState: false, UILabelString: 'Vertical grid', shorthandString: 'vertical grid', ToggleObjectString: 'toggleVerticalGrid', DOMObjectString: 'grid-vertical', URLParamString: 'gridV', filenameStringOn: 'ver', filenameStringOff: ''};
export let showHorizontalGrid =      { keyboardShortcut: 'KeyH',     keyboardShortcutLetter: 'H',  shownInViewPanel: true, defaultState: false, boolState: false, UILabelString: 'Horizontal grid', shorthandString: 'horizontal grid', ToggleObjectString: 'toggleHorizontalGrid', DOMObjectString: 'grid-horizontal', URLParamString: 'gridH', filenameStringOn: 'hor', filenameStringOff: ''};
export let showTerminal =             { keyboardShortcut: 'Backquote', keyboardShortcutLetter: '~',  shownInViewPanel: true, defaultState: false, boolState: false, UILabelString: 'Log', shorthandString: 'terminal', ToggleObjectString: 'toggleTerminal', DOMObjectString: 'logContainer', URLParamString: 'cmd', filenameStringOn: '', filenameStringOff: ''};

export let showMetricsPanel =         { keyboardShortcut: 'KeyM',     keyboardShortcutLetter: 'M',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Metrics Panel', shorthandString: 'metrics panel', ToggleObjectString: 'toggleMetrics', DOMObjectString: 'metrics-panel', URLParamString: 'metricsPanel', filenameStringOn: '', filenameStringOff: ''};
export let showSpawnPanel =           { keyboardShortcut: 'KeyS',     keyboardShortcutLetter: 'S',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Simulation Panel', shorthandString: 'simulation panel', ToggleObjectString: 'toggleSimulationPanel', DOMObjectString: 'simulation-panel', URLParamString: 'simulationPanel', filenameStringOn: '', filenameStringOff: ''};
export let showViewPanel =            { keyboardShortcut: 'KeyV',     keyboardShortcutLetter: 'V',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'View Panel', shorthandString: 'view panel', ToggleObjectString: 'toggleViewPanel', DOMObjectString: 'UIContainer', URLParamString: 'viewPanel', filenameStringOn: '', filenameStringOff: ''};
export let showSettingsPanel =        { keyboardShortcut: 'KeyT',     keyboardShortcutLetter: 'T',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Settings Panel', shorthandString: 'settings panel', ToggleObjectString: 'toggleSettingsPanel', DOMObjectString: 'settings-panel', URLParamString: 'settingsPanel', filenameStringOn: '', filenameStringOff: ''};
export let showExportPanel =          { keyboardShortcut: 'KeyX',     keyboardShortcutLetter: 'X',  shownInViewPanel: true, defaultState: true, boolState: true, UILabelString: 'Export Panel', shorthandString: 'export panel', ToggleObjectString: 'toggleExportPanel', DOMObjectString: 'export-panel', URLParamString: 'exportPanel', filenameStringOn: '', filenameStringOff: ''};
export let showFavouritesPanel =     { keyboardShortcut: 'KeyF',     keyboardShortcutLetter: 'F',  shownInViewPanel: true, defaultState: false, boolState: false, UILabelString: 'Favourites', shorthandString: 'favourites panel', ToggleObjectString: 'toggleFavouritesPanel', DOMObjectString: 'favourites-panel', URLParamString: 'favouritesPanel', filenameStringOn: '', filenameStringOff: ''};

/** View-panel toggles in display order for export filename (values only; empty filenameStringOn/Off = skip). */
export const viewPanelTogglesForFilename = [
  showNodeLabel, showCoordinates, showForceArrows, showForceArrowsLabels,
  showObservations, showNodeLines, showBackground, showWindStress, showWindNetForceArrows,
  showCircles, showNodeIcon, showAxis, showHorizontalGrid, showVerticalGrid
];


const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const showSettings = [
  showNodeLabel,
  showCoordinates,
  showForceArrows,
  showForceArrowsLabels,
  showNetForce,
  showObservations,
  showNodeLines,
  showBackground,
  showWindStress,
  showWindStressLabel,
  showWindCancel,
  showWindCancelLabel,
  showWindNetForceArrows,
  showCircles,
  showNodeIcon,
  showNodeLinks,
  showAxis,
  showVerticalGrid,
  showHorizontalGrid,
  showSpawnPanel,
  showViewPanel,
  showSettingsPanel,
  showMetricsPanel,
  showExportPanel,
  showFavouritesPanel,
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
    UIElement.id = "label_" + setting.ToggleObjectString;
    if(!setting.shownInViewPanel) {UIElement.setAttribute("style","display:none;");}
    let UIElementInput = document.createElement("input");
    UIElementInput.id = setting.ToggleObjectString;
    UIElementInput.type = "checkbox";
    UIElementInput.setAttribute("keyboardShortcut", setting.keyboardShortcut);
    UIElement.appendChild(UIElementInput);
    //UIElement.appendChild(document.createTextNode(' [ ' + (index+1) + ' ] ' + setting.UILabelString));
    const kbd = document.createElement("kbd");
    kbd.textContent = setting.keyboardShortcutLetter;
    UIElement.appendChild(kbd);
    const span = document.createElement("span");
    span.textContent = setting.UILabelString;
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
  // Always persist the current state explicitly, even if it matches the default,
  // so historical URLs remain accurate if defaults change later.
  url.searchParams.set(param, bool ? "1" : "0");

  // Update the browser's URL bar but don’t reload or add a new history entry:
  window.history.replaceState({}, "", url);
}
