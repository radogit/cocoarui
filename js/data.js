// ========= parameters =========
export const collisionMargin = 10; // Extra space between nodes

// ========= INPUT DATA - NODES ================================

export const nodes = [
    {
        id: "A", x: 550, y: 550, color: 'green', radius: 30, areaRadius: 100, isFixed: false, significance: 100, hotspots: [
            { x: 450, y: 150, intensityFactor: 1.5, width: 200, height: 300, forceType: "attract" },
            { x: 600, y: 100, intensityFactor: 1.2, width: 120, height: 320, forceType: "attract"  },
            { x: 700, y: 280, intensityFactor: 1.2, width: 320, height: 120, forceType: "attract"  }
        ]
    },
    {
        id: "B", x: 300, y: 300, color: 'blue', radius: 40, areaRadius: 150, isFixed: false, significance: 1, hotspots: [
            { x: 200, y: -100, intensityFactor: 1.0, width: 180, height: 80, forceType: "attract"  },
            { x: 250, y: 350, intensityFactor: 1.0, width: 180, height: 80, forceType: "attract"  }
        ]
    },
    {
        id: "C", x: 400, y: 400, color: 'orange', radius: 50, areaRadius: 150, isFixed: false, significance: 100, hotspots: [
            { x: 210, y: -90, intensityFactor: 2.0, width: 180, height: 80, forceType: "attract"  },
            { x: 260, y: 360, intensityFactor: 1.0, width: 180, height: 80, forceType: "attract"  }
        ]
    },
    {
        id: "D", x: 590, y: 180, color: 'purple', radius: 50, areaRadius: 150, isFixed: true, significance: 1, hotspots: []
    },
    {
        id: "E", x: -400, y: 300, color: 'red', radius: 40, areaRadius: 150, isFixed: false, significance: 100, hotspots: [
            { x: -600, y: 200, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
            { x: -600, y: 200, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
            { x: -600, y: 200, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
            { x: -200, y: 200, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
//            { x: -550, y: 50, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
            { x: -250, y: 50, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  },
            { x: -400, y: 0, intensityFactor: 1, width: 80, height: 80, forceType: "attract"  }
        ]
    },
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