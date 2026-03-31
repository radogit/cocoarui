# BubblesConfigurator

Web-based 2D configurator for arranging information “bubbles” (nodes) on a canvas. Users spawn nodes from predefined datasets, adjust layouts via physics simulation and hotspots, and export configurations for use in the companion VR viewer.

**Live version:** [https://radogit.github.io/cocoarui/](https://radogit.github.io/cocoarui/)

**Companion app:** [BubblesVR](https://radogit.github.io/cocoarui-vr/) — view your configurations in immersive VR on mobile. Generate a QR code in BubblesConfigurator, scan it in BubblesVR to load the same layout.

---

## Instructions

1. **Live version** — The public version is available at [https://radogit.github.io/cocoarui/](https://radogit.github.io/cocoarui/), served from the gh-pages branch.
2. **BubblesVR** — The companion VR viewer is at [https://radogit.github.io/cocoarui-vr/](https://radogit.github.io/cocoarui-vr/). Use the [VR] button to generate a QR code; scan it in BubblesVR to load the current layout.

---

## Functionality

- **Spawn presets**: One-click spawning of node sets from datasets (Demo, Paper Pano ascent/descent, VR variants, layouts). Presets can combine entries from multiple sources.
- **Physics simulation**: D3 force simulation with custom forces (Gaussian hotspot attraction, collision, travel). Nodes settle into hotspot-defined regions.
- **Interactive editing**: Drag nodes, fix/unfix positions, adjust opacity, change icons. Metrics panel shows forces, coordinates, diameter.
- **View toggles**: Node circles, labels, icons, axis, grids, background, force arrows. State persisted via URL parameters.
- **Export**: SVG/PNG (square crops), CSV metrics, layout JSON.
- **VR bridge**: Generate QR code with current layout; BubblesVR scans it to load the same configuration.

## Key Concepts

### Node structure

Each node has: `id`, `x`, `y`, `radius`, `color`, `hotspots[]`, `forces[]`, `isFixed`, `representation` (icon key). Hotspots define rectangular regions that attract or repel nodes.

### Coordinate system

- **Data space**: Domain `[-90, 90]` for X and Y; 1 data unit = 1 degree.
- **Scale**: `scaleUnit = minDim / 180` (pixels per degree).

### Bridge format (BubblesVR)

Nodes are serialized as `{ yaw, pitch, size, color, name, representation, opacity }` with `yaw = x`, `pitch = -y`, `size = 2*radius` (angular diameter in degrees). QR payload is JSON `{ v, nodes, settings }` (no URL; works across domains).

---

## Technical Details (for HCI / academic writing)

### Smart Spawning: avoiding local optima

The **multistart grid search** (`js/addNodeMultistart.js`) avoids convergence to a single local optimum by evaluating many candidate positions. For each new node:

1. A grid of candidate positions (default 18×18) covers the canvas.
2. At each grid cell, a candidate node is placed and a **mini simulation** runs for ~80 ticks (Gaussian hotspot + collision forces).
3. For each candidate, **stress** (Σ|F|) and **cancellation** (stress − |ΣF|) are computed. High cancellation indicates opposing forces (near equilibrium).
4. The candidate with **highest stress** is selected and spawned. By exploring the full grid rather than a single start, the algorithm does not depend on one initial placement that might trap the node in a poor local equilibrium.

### Gaussian hotspot force

Force magnitude for each hotspot:

```
f = exp(-distance / hotspot.width) × strength × (intensityFactor / divisor)
```

- **distance** = √(dx² + dy²) from node to hotspot center
- **hotspot.width** controls the falloff scale (wider = softer gradient)
- **intensityFactor** (default 1) scales the contribution
- **divisor** (from `hotspotForceDivisor`) splits attribution when multiple data types share a rectangle (e.g. 2/7 for one type in a 7-way split)
- Direction: along (dx, dy) for `forceType === "attract"`, opposite for repel

### Partial attribution (PPD, PPA datasets)

The **PPD** (Paper Pano descent) and **PPA** (Paper Pano ascent) datasets use **partial attribution** when multiple data types share the same rectangular observation. Each dataset defines `hotspotForceDivisor`: a map `{ hotspotName: divisor }` where `divisor` is the number of types sharing that rectangle.

- **intensityFactor**: This type’s share (e.g. 2 if the type occupies 2 of 11 slots in the rectangle).
- **Effective fraction** = intensityFactor / divisor (e.g. 2/11).

This fraction is used in **both**:

1. **Force magnitude**: `f = … × (intensityFactor / divisor)`. The pull from a shared rectangle is scaled by the type’s share.
2. **Node radius**: effective area = (intensityFactor / divisor) × width × height. The node’s size reflects only its portion of the rectangle.

So shared rectangles contribute proportionally to both the Gaussian attraction and the node’s area-equivalent radius.

### Rectangular hotspots → circles (area-preserving)

Input data uses **rectangular hotspots** (observations). Each node is rendered as a **circle** (2D) or **sphere** (3D). The mapping:

1. **Per hotspot**: effective area = (intensityFactor / divisor) × width × height. Shared rectangles contribute a fraction per type (see partial attribution above).
2. **Average**: avgArea = mean of effective areas over the node’s hotspots.
3. **Equivalent circle**: radius = √(avgArea / π).

This preserves **area** (proportional to information/significance). The circle is the area-equivalent shape; angular diameter in degrees is then 2×radius (in data units).

### Angular diameter: 2D ↔ 3D

- **2D (BubblesConfigurator)**: Data space domain [−90, 90] degrees; scaleUnit = minDim/180. Diameter in degrees = 2×radius (data units). Linear extent per degree is constant.
- **3D (BubblesVR)**: size = 2×radius (angular diameter in degrees). Sphere radius R = D×sin(θ/2) where θ = size, D = distance to sphere center. Angular extent 2×asin(R/D) = θ, so the sphere subtends the same angle as in 2D.
- **Bridge**: size = (2×radius)/scaleUnit = angular diameter in degrees. Preserved across both environments.

### Pitch inversion

**Yes, pitch inversion is required.** D3/SVG uses Y-down (positive Y downward). VR uses pitch-up (positive pitch = up). The bridge applies:

- **Export (Configurator → VR)**: pitch = −y
- **Import (VR)**: yaw = x, pitch as stored (already flipped)

So the coordinate systems are aligned: latitude in VR matches the flipped Y from the 2D configurator.

### Mathematical continuity

| Quantity | BubblesConfigurator (2D) | BubblesVR (3D) |
|---------|--------------------------|----------------|
| Longitude | x (degrees) | yaw = x |
| Latitude | y (degrees, Y-down) | pitch = −y |
| Angular diameter | 2×radius (data units) | size = 2×radius (degrees) |
| Scale | scaleUnit = minDim/180 | 1° = 1° visual field |

Both use the same degree-based coordinate system. The bridge JSON carries (yaw, pitch, size) so a node at (x, y) with radius r in 2D appears at (yaw, pitch) with angular diameter size in 3D without rescaling.

## Technologies

| Technology | Purpose |
|------------|---------|
| **D3.js** v7 | Force simulation, scales, data binding, SVG rendering |
| **Parcel** v2 | Build, bundling, dev server |
| **qrcode** | QR code generation for VR bridge |

## Project Structure

| Path | Role |
|------|------|
| `script.js` | Bootstrap, simulation wiring, spawn/export orchestration |
| `js/scene.js` | SVG container, layers, axes, grid |
| `js/simulation.js` | D3 force simulation setup |
| `js/forces.js` | Custom forces (Gaussian hotspot, collision, travel) |
| `js/nodeRendering.js` | D3 join for circles, icons, labels, force arrows |
| `js/nodeSpawn.js` | Spawn logic, drip-spawn, node ops |
| `js/addNodeMultistart.js` | Smart spawning: multistart grid search |
| `js/spawnPresets.js` | Preset definitions, radius-from-hotspots |
| `js/bubblesVR.js` | VR bridge: `getVRMarkersString()`, QR generation |
| `js/exporter.js` | SVG/PNG/CSV/JSON export |
