/**
 * Colour palette and arrowhead helpers for node/link styling.
 */

export const colours = [
  'red', 'green', 'blue', 'cyan', 'orange', 'purple', 'magenta',
  'darkblue', 'darkgreen', 'coral', 'salmon', 'slateblue', 'teal', 'olive', 'brown', 'darkorange'
];

/** Arrowheads are defined by colour name (e.g. arrowhead-blue). Use this so marker-end works when node.color is a name or a hex from presets. */
export const hexToColourName = {
  "#f00": "red", "#ff0000": "red", "#c00": "red", "#e88": "red",
  "#0f0": "green", "#00ff00": "green", "#0c0": "green", "#8e8": "green", "#00aa55": "green",
  "#00f": "blue", "#0000ff": "blue", "#00aaff": "blue",
  "#ff8000": "orange", "#ff5000": "orange", "#f80": "orange",
  "#80f": "purple", "#800080": "purple", "#900090": "purple",
  "#f0f": "magenta", "#ff00ff": "magenta",
  "#0ff": "cyan", "#00ffff": "cyan"
};

export function colourNameForArrowhead(c) {
  if (!c || typeof c !== "string") return "white";
  const key = c.toLowerCase();
  if (colours.includes(key)) return key;
  if (key.startsWith("#") && hexToColourName[key]) return hexToColourName[key];
  return "white";
}

export function getArrowheadId(color) {
  return "arrowhead-" + colourNameForArrowhead(color);
}
