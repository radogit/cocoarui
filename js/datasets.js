// ========= parameters =========
export const collisionMargin = 0; // Extra space between nodes

// ========= INPUT DATA - NODES ================================
export const nodes = [];

export const preppedNodesDemoSamples = [
  {name: 'Fixed + Float', nodes: [
    {
        id: "D", x: 39, y: 18, color: 'purple', radius: 5, isFixed: true, significance: 1, hotspots: []
    },
    {
        id: "A", x: 35, y: 55, color: 'green', radius: 3, isFixed: false, significance: 100, hotspots: [
            { x: 35, y: 15, intensityFactor: 1.5, width: 20, height: 30, forceType: "attract" },
            { x: 40, y: 10, intensityFactor: 1.2, width: 12, height: 32, forceType: "attract"  },
            { x: 50, y: 28, intensityFactor: 1.2, width: 32, height: 12, forceType: "attract"  }
        ]
    },
]}
,


{name: 'Twins', nodes: [
    {
        id: "B", x: 30, y: 30, color: 'blue', radius: 4, isFixed: false, significance: 1, hotspots: [
            { x: 20, y: -10, intensityFactor: 1.0, width: 18, height: 8, forceType: "attract"  },
            { x: 25, y: 35, intensityFactor: 1.0, width: 18, height: 8, forceType: "attract"  }
        ]
    },
    {
        id: "C", x: 40, y: 40, color: 'orange', radius: 5, isFixed: false, significance: 100, hotspots: [
            { x: 21, y: -9, intensityFactor: 1.0, width: 18, height: 8, forceType: "attract"  },
            { x: 26, y: 36, intensityFactor: 1.0, width: 18, height: 8, forceType: "attract"  }
        ]
    },
]}
,


{name: 'Navigation', nodes: [
    {
        id: "Navigation", representation: 'map', x: -5, y: 10, color: 'blue', radius: 9, isFixed: false, significance: 100, hotspots: [
            { x: 0, y: 6, intensityFactor: 1, width: 30, height: 30, forceType: "attract"  },
            { x: 15, y: -18, intensityFactor: 1, width: 20, height: 25, forceType: "attract"  },
            { x: 27, y: 12, intensityFactor: 1, width: 30, height: 12, forceType: "attract"  },
            { x: -8, y: 78, intensityFactor: 1, width: 10, height: 20, forceType: "attract"  }
        ]
    },
]}
,
{name: 'Speed', nodes: [
    {
        id: "Speed", representation: 'number', x: -5, y: 10, color: 'green', radius: 8, isFixed: false, significance: 100, hotspots: [
            { x: 6, y: 12, intensityFactor: 1, width: 15, height: 30, forceType: "attract"  },
            { x: 15, y: -4, intensityFactor: 1, width: 50, height: 15, forceType: "attract"  },
            { x: 55, y: 12, intensityFactor: 1, width: 12, height: 80, forceType: "attract"  },
            { x: -3, y: 7, intensityFactor: 1, width: 15, height: 23, forceType: "attract"  }
        ]
    },
]}
,
{name: 'Power', nodes: [
    {
        id: "Power", representation: 'radial', x: -5, y: 10, color: 'red', radius: 6, isFixed: false, significance: 100, hotspots: [
            { x: -78, y: 78, intensityFactor: 1, width: 20, height: 20, forceType: "attract"  },
            { x: 0, y: 75, intensityFactor: 1, width: 20, height: 20, forceType: "attract"  },
            { x: -12, y: 35, intensityFactor: 1, width: 20, height: 20, forceType: "attract"  },
            { x: -5, y: 25, intensityFactor: 1, width: 20, height: 20, forceType: "attract"  }
        ]
    },
]}
,


{name: 'Heartrate', nodes: [
    {
        id: "Heartrate", representation: 'symbol', x: -7, y: -8, color: 'purple', radius: 10, isFixed: false, significance: 100, hotspots: [
            { x: -60, y: -30, intensityFactor: 1, width: 10, height: 10, forceType: "attract"  },
            { x: 40, y: -30, intensityFactor: 1, width: 10, height: 10, forceType: "attract"  },
            { x: -48, y: -60, intensityFactor: 1, width: 10, height: 10, forceType: "attract"  },
            { x: 28, y: -60, intensityFactor: 1, width: 10, height: 10, forceType: "attract"  },
            { x: -10, y: -80, intensityFactor: 1, width: 10, height: 10, forceType: "attract"  }
        ]
    },
]},

];


export const preppedNodesKeepFreeSamples = [

    {name: 'Keep-Free', notDraggable: true, nodes: [
        {
            id: "Keep-Free", representation: 'none', x: 0, y: -5, color: 'rgba(0,0,0,0)', radius: 10, isFixed: true, significance: 100, 
            hotspots: [
            ]
        },
    ]},  
    {name: 'Moving Keep-Free', notDraggable: true, nodes: [
        {
            id: "Moving Keep-Free", representation: 'none', x: 0, y: -5, color: 'rgba(0,0,0,0)', radius: 5, isFixed: true, significance: 100, 
            travelMode: 'line', travelPhase: 0, travelSpeed: 100, travelFrom: { x: 0, y: 0 }, travelTo:   { x:  -30, y: 400 }, radiusFinal: 30, 
            hotspots: [
            ]
        },
    ]}  

];


// fix: flip the y-axis as browser-y+ is DOWN, and math-y+ is UP
// Flip Y so that positive y is up in our math sense
export function flipYCoordinates(nodes) {

    nodes.forEach(node => {
        // Flip the node’s y-value
        node.y = -node.y;

        // Flip each hotspot’s y-value
        node.hotspots.forEach(h => {
            h.y = -h.y;
        });
    });
}

// Ensure that nodes that start as fixed remain fixed
export function fixInitially(nodes) {
    nodes.forEach(d => {
      if (d.isFixed) {
        d.fx = d.x;
        d.fy = d.y;
      }
    });
  }

// adjust x and y coordinates to match the adjusted scale units
export function adjustCoordinatesToScale(nodes, scaleUnit) {

    nodes.forEach(node => {
        // Flip the node’s y-value
        node.y = node.y * scaleUnit;
        node.x = node.x * scaleUnit;
        node.radius = node.radius * scaleUnit;

        // Flip each hotspot’s y-value
        node.hotspots.forEach(h => {
            h.x = h.x * scaleUnit;
            h.y = h.y * scaleUnit;
            h.width = h.width * scaleUnit;
            h.height = h.height * scaleUnit;
        });
    });
}

/**
 * ----------------------------------------------
 * UNITY CSV IMPORTER (new format)
 * ----------------------------------------------
 */

/**
 * Parse CSV exported from Unity into hotspot objects.
 * Each row becomes ONE hotspot.
 *
 * Expected columns include:
 *   id flags   → e.g. "power", "map", etc (0/1)
 *   posX,posY  → centre position
 *   scaleX,scaleY → size
 *
 * @param {string} text – contents of the CSV/TXT file
 * @returns {Array} hotspot objects
 */
export function parseUnityCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  const index = name => header.indexOf(name);

  const posX = index("posX");
  const posY = index("posY");
  const scaleX = index("scaleX");
  const scaleY = index("scaleY");

  // detect which columns correspond to node membership flags
  const nodeFlagColumns = header
    .filter(h => !["posX","posY","scaleX","scaleY"].includes(h));

  const hotspots = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");

    // determine parent node name
    let nodeId = null;
    for (const flag of nodeFlagColumns) {
      if (cols[index(flag)] === "1") {
        nodeId = flag; 
        break;
      }
    }
    if (!nodeId) continue; // skip rows with no node assignment

    hotspots.push({
      nodeId,
      x: parseFloat(cols[posX]),
      y: parseFloat(cols[posY]),
      width: parseFloat(cols[scaleX]),
      height: parseFloat(cols[scaleY]),
      intensityFactor: 1.0,
      forceType: "attract"
    });
  }

  return hotspots;
}


/**
 * Group Unity hotspots into D3 nodes.
 *
 * @param {Array} hotspots parsed via parseUnityCSV()
 * @returns {Array} nodes in the D3 simulation format
 */
export function groupUnityHotspotsByNode(hotspots) {
  const groups = {};

  hotspots.forEach(h => {
    if (!groups[h.nodeId]) {
      groups[h.nodeId] = [];
    }
    groups[h.nodeId].push(h);
  });

  // convert to node objects
  return Object.entries(groups).map(([id, hs]) => {
    // radius suggestion: average size
    const avgRadius = hs.reduce((s, h) =>
      s + (h.width + h.height) / 4
    , 0) / hs.length;

    return {
      id,
      x: 0,
      y: 0,
      color: "random",
      radius: avgRadius,
      isFixed: false,
      significance: 1,
      hotspots: hs
    };
  });
}


// ======================================================================
// UNITY CSV IMPORT  (hotspots exported from Unity)
// ======================================================================

/**
 * Array to hold datasets that come from Unity exports.
 * Structure matches your other preppedSets:
 *   { name, nodes, notDraggable? }
 */
export const unityPreppedNodes = [];

/**
 * Parse a Unity-exported TSV (your .txt file) into an array of row objects.
 * Each row: { raw: string[], get: (colName) => number|string, bool: (colName)=>boolean }
 *
 * We use the header row to build a name → index map, so the parser
 * stays robust if the column order changes.
 *
 * @param {string} text Full file contents
 * @returns {Array<Object>}
 */
function parseUnityTsv(text) {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  const header = lines[0].split("\t");
  const indexByName = {};
  header.forEach((h, i) => {
    indexByName[h] = i;
  });

  const rows = lines.slice(1).map(line => {
    const cols = line.split("\t");

    const getRaw = (name) => {
      const idx = indexByName[name];
      if (idx == null) return null;
      return cols[idx];
    };

    const getNumber = (name) => {
      const v = getRaw(name);
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const getBool = (name) => {
      const v = (getRaw(name) || "").toLowerCase();
      // typical Unity / CSV encodings: 1/0, true/false, yes/no
      return v === "1" || v === "true" || v === "yes";
    };

    return {
      raw: cols,
      getRaw,
      getNumber,
      getBool
    };
  });

  return rows;
}

/**
 * Convert ONE Unity row into a hotspot {x,y,width,height,…} in your
 * D3 / heatmap format.
 *
 * Right now we rely on:
 *   child.transform.position.x / .y     → hotspot centre
 *   child.transform.localScale.x / .y  → hotspot width & height
 *
 * All in Unity's coordinate space; we keep them as-is.
 * You already have adjustCoordinatesToScale(...) and flipYCoordinates(...)
 * for converting into your simulation’s coordinate system when needed.
 *
 * @param {Object} row Parsed row from parseUnityTsv
 * @returns {Object} hotspot
 */
function unityRowToHotspot(row) {
  // centre position (Unity world / screen space)
  const x = row.getNumber("child.transform.localEulerAngles.x") * 100 + 5;
  const y = row.getNumber("child.transform.localEulerAngles.y") * 100 + 5;

  // size (local scale of the child container)
  const width  = Math.abs(row.getNumber("child.transform.localScale.x")) * 100 +5 ;
  const height = Math.abs(row.getNumber("child.transform.localScale.y")) * 100 +5;

  return {
    x,
    y,
    width,
    height,
    intensityFactor: 1.0,
    forceType: "attract"
  };
}

/**
 * Estimate a reasonable node radius from its hotspots:
 * we take the bounding box of all hotspots and use half the diagonal.
 *
 * @param {Array} hotspots
 * @returns {number} radius
 */
function estimateRadiusFromHotspots(hotspots) {
  if (!hotspots || hotspots.length === 0) return 50; // safe default

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  hotspots.forEach(h => {
    const left   = h.x - h.width  / 2;
    const right  = h.x + h.width  / 2;
    const top    = h.y - h.height / 2;
    const bottom = h.y + h.height / 2;

    if (left   < minX) minX = left;
    if (right  > maxX) maxX = right;
    if (top    < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  });

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const diag  = Math.sqrt(spanX * spanX + spanY * spanY);
  
  console.log("hotspots.length");
  console.log(hotspots.length);
  console.log("diag");
  console.log(diag);

  return diag / 2;
}

/**
 * MAIN ENTRY:
 * Load a Unity-exported TSV/CSV file and create a single-node dataset.
 *
 * Signature chosen to match what you wrote:
 *
 *   loadUnityDataset(
 *     urlToTxtFile,
 *     groupColumn,   // e.g. 'type'        (currently NOT used, kept for future)
 *     nodeId,        // e.g. 'power'
 *     displayName,   // e.g. 'Power - PP - ascent'
 *     options        // optional { color, isFixed, notDraggable }
 *   )
 *
 * For now we assume the file is already pre-filtered (only hotspots
 * for that node). In the future, we can actually use groupColumn / nodeId
 * to filter here if you want.
 *
 * It:
 *   • fetches the file
 *   • parses Unity rows → hotspots
 *   • estimates a node radius
 *   • constructs a {name, nodes:[node]} bundle
 *   • pushes it into unityPreppedNodes
 *   • returns the bundle
 */
export async function loadUnityDataset(
  url,
  groupColumn,       // not used yet – reserved
  nodeId,
  displayName,
  options = {}
) {
  const res = await fetch(url);
  const text = await res.text();

//0309   const rows = parseUnityTsv(text);
  const rows = parseUnityFixed(text);

  // In the v1 version: no extra filtering, we trust the file is already filtered.
//   const hotspots = rows.map(unityRowToHotspot);
  const hotspots = rows.map(unityRowToHotspotByIndex);
  console.log("rows.length");
  console.log(rows.length);

  const radius = estimateRadiusFromHotspots(hotspots);

  const nodeColor = options.color || "orange";
  const isFixed   = options.isFixed ?? false;

  const node = {
    id: nodeId,
    x: 3,
    y: 3,
    color: nodeColor,
    representation: "number",
    radius,
    isFixed,
    significance: 1,
    hotspots
  };
console.log("node");
console.log(node);

  const bundle = {
    name: displayName || nodeId,
    nodes: [node],
    notDraggable: options.notDraggable ?? false
  };

  unityPreppedNodes.push(bundle);
  return bundle;
}


// ======================================================================
// UNITY CSV IMPORT  (hotspots exported from Unity, FIXED COLUMN ORDER)
// ======================================================================

/**
 * 0-based column indices in the Unity TSV.
 * These are based on your current export and WILL break if you
 * change the export format – which you said you won't. :)
 *
 * 1-based positions in the file (for your own reference):
 *   7  = gazeAngle  ("pitch, yaw, roll")
 *   26 = localScale.x
 *   27 = localScale.y
 *   113 = power
 */
const COL_GAZE_ANGLE    = 6;   // 7th column
const COL_LOCAL_SCALE_X = 25;  // 26th column
const COL_LOCAL_SCALE_Y = 26;  // 27th column
const COL_POWER_FLAG    = 112; // 113th column

/**
 * Super simple parser:
 *  - split into lines
 *  - drop header
 *  - split each line on TAB
 * No header map, no magic.
 */
function parseUnityFixed(text) {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  // Drop the header line – we don't use it anymore
  return lines.slice(1).map(line => line.split("\t"));
}

/**
 * Convert ONE Unity row (array of strings) into a hotspot.
 * Everything is defined purely in terms of column indices.
 *
 * - gazeAngle = "pitch, yaw, roll"  -> x = yaw, y = pitch
 * - localScale.x / .y               -> width / height
 */
function unityRowToHotspotByIndex(cols) {
  // ---- gazeAngle → pitch/yaw ----
  const gaze = cols[COL_GAZE_ANGLE] || "";
  const parts = gaze.split(",");
  const pitch = parseFloat(parts[0]) || 0; // vertical
  const yaw   = parseFloat(parts[1]) || 0; // horizontal

  // In your equirectangular plot:
  //   x = yaw, y = pitch
  const x = yaw;
  const y = pitch;

  // ---- size from localScale ----
  const sx = parseFloat(cols[COL_LOCAL_SCALE_X]) || 1;
  const sy = parseFloat(cols[COL_LOCAL_SCALE_Y]) || 1;

  // Some reasonable scaling; tweak to taste.
  const width  = sx * 10;
  const height = sy * 10;

  return {
    x,
    y,
    width,
    height,
    intensityFactor: 1.0,
    forceType: "attract"
  };
}
