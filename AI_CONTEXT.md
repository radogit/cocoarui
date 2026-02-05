## AI Context

This is a D3.js app.

- **D3 version**: v7 (`d3@^7.9.0`)
- **Build tool**: Parcel v2 (no framework; HTML + ES modules)
- **Entry point**: `index.html` + `script.js` (loaded as `type="module"`)
- **Chart / visualization modules**: Plain JS modules in `js/` (e.g., `drawing.js`, `forces.js`, `datasets*.js`, `heatmaps.js`, `ui.js`, `exporter.js`)

### State & Data Flow

- **Global state lives in**: `Datasets.nodes` (mutable array of node objects) plus a few module-level config objects (e.g., `AppUI` in `ui.js`).
- **Node structure**: Each node typically has `id`, `x/y`, `radius`, `color`, `hotspots[]`, `forces[]`, `isFixed`, optional `representation` (icon key), and sometimes travel-related fields.
- **Forces**: Custom forces in `js/forces.js` (Gaussian hotspot attraction, collision, travel) update node positions each simulation tick; forces are also stored in `node.forces[]` for visualization and metrics.
- **Rendering pipeline**: `js/drawing.js` and `script.js` collaborate to create SVG layers and perform D3 joins; `ticked()` in `script.js` is the main per-tick update.
- **UI state**: `js/ui.js` holds toggle definitions (view layers, metrics, export), keyboard shortcuts, and URL-parameter–backed boolean state.

### Project Structure (High-Level)

- **`index.html`**: Static shell that loads CSS and `script.js`, defines control panels (View, Spawn, Metrics, Export) and layout containers.
- **`script.js`**: App bootstrap and glue; initializes the D3 force simulation, sets up SVG containers, configures forces, binds drag/interaction handlers, drives spawning logic and metrics updates.
- **`js/datasets*.js`**: Dataset definitions (including VR variants), coordinate transforms (flip Y, scaling), and population of `Datasets.nodes`.
- **`js/forces.js`**: Custom D3 force implementations for hotspots, collisions, and scripted travel.
- **`js/drawing.js` / `js/heatmaps.js`**: SVG and hotspot/background layer creation; helpers for drawing bubbles and force/heatmap overlays.
- **`js/ui.js`**: Definition of UI toggles, keyboard bindings, and DOM show/hide logic plus URL query-string persistence.
- **`js/exporter.js`**: Export routines for SVG/PNG (square crops, hiding debug/auxiliary layers) and CSV.
- **`style.css`**: Visual styling and layout for the panels, canvas, and debug layers.

### Canvas & Coordinate System

- **SVG size**: SVG fills 100% of browser window (`window.innerWidth` × viewport height) from initialization; matches resize behavior (no mismatch).
- **Container**: Inner `<g class="container">` is translated to center of SVG (`translate(width/2, height/2)`); all visualization layers are children of this container.
- **Data space**: Axes use domain `[-90, 90]` for both X and Y; range spans `minDim` pixels (where `minDim = Math.min(width, height)`), forming a square data region centered at container origin.
- **Coordinate scaling**: `scaleUnit = minDim/180`; used to convert between data coordinates and pixel space. Y-axis is flipped (positive Y is up in data space).
- **Resize handling**: `onResize()` updates SVG to full window dimensions and scales the container uniformly to maintain the same logical data extent.

### Implementation Preferences & Conventions

- **Prefer explicit D3 scales & joins**: Use explicit `d3.scale*` and `selection.data(...).join(...)` where appropriate; avoid opaque helper abstractions that hide the data binding.
- **Preserve global-node pattern**: New features should respect `Datasets.nodes` as the single source of truth for nodes unless there’s a compelling reason to introduce new state containers.
- **Simulation-first logic**: When adding behaviors that affect positions, integrate them as forces (or coordinated with the existing tick function) rather than manual DOM updates.
- **URL-driven UI**: When adding new toggles or panels, mirror the existing pattern in `ui.js` so state remains driven by URL parameters and keyboard shortcuts.
- **Exports**: When extending export behavior, route changes through `js/exporter.js` instead of ad-hoc DOM serialization in other modules.
