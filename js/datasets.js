// ========= parameters =========
export const collisionMargin = 10; // Extra space between nodes

// ========= INPUT DATA - NODES ================================
export const nodes = [];

export const preppedNodes0 = [
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
            { x: 0, y: 6, intensityFactor: 1, width: 3, height: 3, forceType: "attract"  },
            { x: 15, y: -18, intensityFactor: 1, width: 2, height: 25, forceType: "attract"  },
            { x: 27, y: 12, intensityFactor: 1, width: 3, height: 12, forceType: "attract"  },
            { x: -8, y: 78, intensityFactor: 1, width: 1, height: 2, forceType: "attract"  }
        ]
    },
]}
,
{name: 'Speed', nodes: [
    {
        id: "Speed", representation: 'number', x: -5, y: 10, color: 'green', radius: 8, isFixed: false, significance: 100, hotspots: [
            { x: 6, y: 12, intensityFactor: 1, width: 15, height: 3, forceType: "attract"  },
            { x: 15, y: -4, intensityFactor: 1, width: 5, height: 15, forceType: "attract"  },
            { x: 55, y: 12, intensityFactor: 1, width: 12, height: 8, forceType: "attract"  },
            { x: -3, y: 7, intensityFactor: 1, width: 15, height: 23, forceType: "attract"  }
        ]
    },
]}
,
{name: 'Power', nodes: [
    {
        id: "Power", representation: 'radial', x: -5, y: 10, color: 'red', radius: 6, isFixed: false, significance: 100, hotspots: [
            { x: -78, y: 78, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: 0, y: 75, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: -12, y: 35, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: -5, y: 25, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  }
        ]
    },
]}
,


{name: 'Heartrate', nodes: [
    {
        id: "Heartrate", representation: 'symbol', x: -7, y: -8, color: 'purple', radius: 7, isFixed: false, significance: 100, hotspots: [
            { x: -6, y: -3, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: 4, y: -3, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: -48, y: -6, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: 28, y: -6, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  },
            { x: -1, y: -8, intensityFactor: 1, width: 2, height: 2, forceType: "attract"  }
        ]
    },
]},

];

export const preppedNodes = [


{ "name": "Aero - PP - descent", "nodes": [
        { "id": "aero", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 0, "isFixed": false, "significance": 100, "hotspots": []
        }
]},
{ "name": "Braking - PP - descent", "nodes": [
        { "id": "braking", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 12.0925, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.4", "x": 0.0, "y": -31.61, "intensityFactor": 1, "width": 14.03, "height": 17.87, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"}
            ]
        }
]},
{ "name": "Cadence - PP - descent", "nodes": [
        { "id": "cadence", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 19.78625, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "787.7", "x": 37.5, "y": -30.96, "intensityFactor": 1, "width": 17.86, "height": 7.01, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"}
            ]
        }
]},
{ "name": "Distance - PP - descent", "nodes": [
        { "id": "distance", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 13.91861111, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.11", "x": -5.0, "y": 12.76, "intensityFactor": 1, "width": 9.35, "height": 4.58, "forceType": "attract"},
                {"name": "136.11", "x": -47.5, "y": 14.65, "intensityFactor": 1, "width": 17.68, "height": 10.67, "forceType": "attract"},
                {"name": "136.12", "x": 45.0, "y": 6.13, "intensityFactor": 1, "width": 21.39, "height": 14.75, "forceType": "attract"},
                {"name": "136.8", "x": 0.0, "y": -26.87, "intensityFactor": 1, "width": 28.43, "height": 10.87, "forceType": "attract"},
                {"name": "192.9", "x": -42.5, "y": 2.07, "intensityFactor": 1, "width": 10.39, "height": 5.19, "forceType": "attract"},
                {"name": "241.8", "x": 65.0, "y": 1.14, "intensityFactor": 1, "width": 11.42, "height": 4.58, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.10", "x": 52.5, "y": 20.48, "intensityFactor": 1, "width": 38.31, "height": 18.08, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "502.6", "x": 30.0, "y": -12.88, "intensityFactor": 1, "width": 14.65, "height": 4.78, "forceType": "attract"},
                {"name": "599.2", "x": -52.5, "y": -62.49, "intensityFactor": 1, "width": 65.24, "height": 12.65, "forceType": "attract"},
                {"name": "679.7", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 40.27, "height": 10.7, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "787.10", "x": 12.5, "y": 8.06, "intensityFactor": 1, "width": 15.53, "height": 12.81, "forceType": "attract"},
                {"name": "787.6", "x": 0.0, "y": 32.23, "intensityFactor": 1, "width": 20.29, "height": 2.19, "forceType": "attract"},
                {"name": "822.12", "x": 35.0, "y": -21.8, "intensityFactor": 1, "width": 17.86, "height": 6.07, "forceType": "attract"},
                {"name": "822.13", "x": -47.5, "y": -2.45, "intensityFactor": 1, "width": 11.42, "height": 19.44, "forceType": "attract"},
                {"name": "857.4", "x": 25.0, "y": -63.43, "intensityFactor": 1, "width": 36.01, "height": 17.79, "forceType": "attract"}
            ]
        }
]},
{ "name": "Elevation - PP - descent", "nodes": [
        { "id": "elevation", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 15.73333333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "136.8", "x": 0.0, "y": -26.87, "intensityFactor": 1, "width": 28.43, "height": 10.87, "forceType": "attract"},
                {"name": "192.9", "x": -42.5, "y": 2.07, "intensityFactor": 1, "width": 10.39, "height": 5.19, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.7", "x": 25.0, "y": 2.51, "intensityFactor": 1, "width": 22.62, "height": 21.21, "forceType": "attract"},
                {"name": "599.2", "x": -52.5, "y": -62.49, "intensityFactor": 1, "width": 65.24, "height": 12.65, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"}
            ]
        }
]},
{ "name": "Gears - PP - descent", "nodes": [
        { "id": "gears", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 5.72, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "679.2", "x": -37.5, "y": -8.28, "intensityFactor": 1, "width": 8.32, "height": 14.36, "forceType": "attract"},
                {"name": "775.4", "x": 10.0, "y": 1.63, "intensityFactor": 1, "width": 6.54, "height": 3.27, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"}
            ]
        }
]},
{ "name": "Gradient - PP - descent", "nodes": [
        { "id": "gradient", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 13.454, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.10", "x": 52.5, "y": 20.48, "intensityFactor": 1, "width": 38.31, "height": 18.08, "forceType": "attract"},
                {"name": "502.6", "x": 30.0, "y": -12.88, "intensityFactor": 1, "width": 14.65, "height": 4.78, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"}
            ]
        }
]},
{ "name": "Heartrate - PP - descent", "nodes": [
        { "id": "heartrate", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 14.1015, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "192.8", "x": -30.0, "y": -41.63, "intensityFactor": 1, "width": 5.09, "height": 2.85, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.3", "x": -62.5, "y": 29.91, "intensityFactor": 1, "width": 8.89, "height": 3.87, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "502.7", "x": -45.0, "y": -66.37, "intensityFactor": 1, "width": 37.85, "height": 6.55, "forceType": "attract"},
                {"name": "679.6", "x": -55.0, "y": -63.43, "intensityFactor": 1, "width": 33.4, "height": 6.4, "forceType": "attract"},
                {"name": "787.9", "x": -42.5, "y": -14.93, "intensityFactor": 1, "width": 22.62, "height": 17.58, "forceType": "attract"},
                {"name": "822.10", "x": -32.5, "y": -6.84, "intensityFactor": 1, "width": 16.69, "height": 13.59, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "989.6", "x": -32.5, "y": -41.99, "intensityFactor": 1, "width": 17.06, "height": 14.82, "forceType": "attract"}
            ]
        }
]},
{ "name": "Hydration - PP - descent", "nodes": [
        { "id": "hydration", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 8.019166667, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "192.10", "x": -80.0, "y": -48.81, "intensityFactor": 1, "width": 4.91, "height": 7.54, "forceType": "attract"},
                {"name": "408.7", "x": 55.0, "y": 4.16, "intensityFactor": 1, "width": 8.58, "height": 14.06, "forceType": "attract"},
                {"name": "502.7", "x": -45.0, "y": -66.37, "intensityFactor": 1, "width": 37.85, "height": 6.55, "forceType": "attract"},
                {"name": "787.4", "x": -37.5, "y": 22.18, "intensityFactor": 1, "width": 5.21, "height": 4.13, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "903.3", "x": 50.0, "y": -60.64, "intensityFactor": 1, "width": 22.62, "height": 4.99, "forceType": "attract"}
            ]
        }
]},
{ "name": "Lactate - PP - descent", "nodes": [
        { "id": "lactate", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 0, "isFixed": false, "significance": 100, "hotspots": []
        }
]},
{ "name": "Navigation - PP - descent", "nodes": [
        { "id": "navigation", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.399347826, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.15", "x": 0.0, "y": -12.41, "intensityFactor": 1, "width": 10.29, "height": 11.16, "forceType": "attract"},
                {"name": "072.3", "x": 0.0, "y": -4.68, "intensityFactor": 1, "width": 21.62, "height": 25.53, "forceType": "attract"},
                {"name": "072.4", "x": 0.0, "y": -31.61, "intensityFactor": 1, "width": 14.03, "height": 17.87, "forceType": "attract"},
                {"name": "136.12", "x": 45.0, "y": 6.13, "intensityFactor": 1, "width": 21.39, "height": 14.75, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"},
                {"name": "241.4", "x": 0.0, "y": 33.28, "intensityFactor": 1, "width": 15.94, "height": 3.78, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.7", "x": 25.0, "y": 2.51, "intensityFactor": 1, "width": 22.62, "height": 21.21, "forceType": "attract"},
                {"name": "404.4", "x": 0.0, "y": -2.29, "intensityFactor": 1, "width": 15.94, "height": 29.13, "forceType": "attract"},
                {"name": "408.9", "x": 0.0, "y": -9.61, "intensityFactor": 1, "width": 10.55, "height": 10.4, "forceType": "attract"},
                {"name": "502.4", "x": 0.0, "y": 0.0, "intensityFactor": 1, "width": 22.62, "height": 34.35, "forceType": "attract"},
                {"name": "599.4", "x": -60.0, "y": -79.38, "intensityFactor": 1, "width": 36.87, "height": 7.03, "forceType": "attract"},
                {"name": "599.9", "x": 60.0, "y": -79.38, "intensityFactor": 1, "width": 29.86, "height": 5.63, "forceType": "attract"},
                {"name": "679.14", "x": 10.0, "y": -30.31, "intensityFactor": 1, "width": 14.9, "height": 8.36, "forceType": "attract"},
                {"name": "679.9", "x": -2.5, "y": -24.87, "intensityFactor": 1, "width": 12.45, "height": 26.46, "forceType": "attract"},
                {"name": "775.3", "x": -5.0, "y": -11.31, "intensityFactor": 1, "width": 4.36, "height": 5.35, "forceType": "attract"},
                {"name": "787.10", "x": 12.5, "y": 8.06, "intensityFactor": 1, "width": 15.53, "height": 12.81, "forceType": "attract"},
                {"name": "822.3", "x": -7.5, "y": -20.9, "intensityFactor": 1, "width": 32.44, "height": 42.68, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "903.5", "x": 0.0, "y": -17.1, "intensityFactor": 1, "width": 6.16, "height": 30.44, "forceType": "attract"},
                {"name": "903.6", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 33.4, "height": 18.61, "forceType": "attract"},
                {"name": "930.5", "x": -37.5, "y": 17.13, "intensityFactor": 1, "width": 15.19, "height": 7.01, "forceType": "attract"},
                {"name": "989.5", "x": 0.0, "y": -8.75, "intensityFactor": 1, "width": 8.8, "height": 15.59, "forceType": "attract"}
            ]
        }
]},
{ "name": "Nutrition - PP - descent", "nodes": [
        { "id": "nutrition", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 6.55375, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "408.8", "x": 40.0, "y": 6.96, "intensityFactor": 1, "width": 8.58, "height": 12.36, "forceType": "attract"},
                {"name": "423.5", "x": 0.0, "y": -2.08, "intensityFactor": 1, "width": 4.17, "height": 8.31, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "903.3", "x": 50.0, "y": -60.64, "intensityFactor": 1, "width": 22.62, "height": 4.99, "forceType": "attract"}
            ]
        }
]},
{ "name": "Power - PP - descent", "nodes": [
        { "id": "power", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 12.58818182, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.13", "x": -7.5, "y": -24.44, "intensityFactor": 1, "width": 8.32, "height": 2.84, "forceType": "attract"},
                {"name": "136.5", "x": -47.5, "y": -20.47, "intensityFactor": 1, "width": 19.67, "height": 12.83, "forceType": "attract"},
                {"name": "241.6", "x": -57.5, "y": -5.71, "intensityFactor": 1, "width": 13.69, "height": 6.83, "forceType": "attract"},
                {"name": "378.3", "x": -47.5, "y": 6.87, "intensityFactor": 1, "width": 14.25, "height": 15.08, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.4", "x": -47.5, "y": 29.91, "intensityFactor": 1, "width": 8.89, "height": 3.87, "forceType": "attract"},
                {"name": "408.5", "x": -40.0, "y": 6.35, "intensityFactor": 1, "width": 11.42, "height": 8.31, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "679.10", "x": 60.0, "y": -19.8, "intensityFactor": 1, "width": 18.18, "height": 17.12, "forceType": "attract"},
                {"name": "787.5", "x": 27.5, "y": -12.88, "intensityFactor": 1, "width": 25.75, "height": 9.55, "forceType": "attract"},
                {"name": "903.6", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 33.4, "height": 18.61, "forceType": "attract"}
            ]
        }
]},
{ "name": "Speed - PP - descent", "nodes": [
        { "id": "speed", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.904166667, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.14", "x": 45.0, "y": -1.91, "intensityFactor": 1, "width": 17.06, "height": 7.62, "forceType": "attract"},
                {"name": "136.11", "x": -47.5, "y": 14.65, "intensityFactor": 1, "width": 17.68, "height": 10.67, "forceType": "attract"},
                {"name": "136.7", "x": 0.0, "y": -8.84, "intensityFactor": 1, "width": 10.16, "height": 21.14, "forceType": "attract"},
                {"name": "136.9", "x": 45.0, "y": -21.8, "intensityFactor": 1, "width": 10.0, "height": 9.29, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"},
                {"name": "192.6", "x": 47.5, "y": -48.81, "intensityFactor": 1, "width": 6.54, "height": 4.31, "forceType": "attract"},
                {"name": "241.5", "x": 60.0, "y": -13.74, "intensityFactor": 1, "width": 15.19, "height": 12.32, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.6", "x": -32.5, "y": 28.9, "intensityFactor": 1, "width": 8.89, "height": 4.72, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "423.7", "x": 0.0, "y": -19.57, "intensityFactor": 1, "width": 5.09, "height": 4.8, "forceType": "attract"},
                {"name": "502.5", "x": 27.5, "y": -5.38, "intensityFactor": 1, "width": 13.42, "height": 10.71, "forceType": "attract"},
                {"name": "599.11", "x": 0.0, "y": -8.75, "intensityFactor": 1, "width": 12.29, "height": 6.96, "forceType": "attract"},
                {"name": "599.5", "x": 10.0, "y": -8.75, "intensityFactor": 1, "width": 7.04, "height": 5.22, "forceType": "attract"},
                {"name": "679.5", "x": 40.0, "y": -16.7, "intensityFactor": 1, "width": 41.61, "height": 23.8, "forceType": "attract"},
                {"name": "775.5", "x": 2.5, "y": 0.0, "intensityFactor": 1, "width": 6.24, "height": 5.21, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "787.8", "x": 35.0, "y": -22.5, "intensityFactor": 1, "width": 21.04, "height": 10.56, "forceType": "attract"},
                {"name": "822.6", "x": 35.0, "y": -12.68, "intensityFactor": 1, "width": 18.46, "height": 9.76, "forceType": "attract"},
                {"name": "857.4", "x": 25.0, "y": -63.43, "intensityFactor": 1, "width": 36.01, "height": 17.79, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "903.4", "x": 55.0, "y": -60.64, "intensityFactor": 1, "width": 27.47, "height": 11.2, "forceType": "attract"},
                {"name": "930.7", "x": 37.5, "y": -15.31, "intensityFactor": 1, "width": 14.4, "height": 4.65, "forceType": "attract"},
                {"name": "989.7", "x": 30.0, "y": -41.99, "intensityFactor": 1, "width": 22.62, "height": 8.5, "forceType": "attract"}
            ]
        }
]},
{ "name": "Strategy - PP - descent", "nodes": [
        { "id": "strategy", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 8.1975, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "136.8", "x": 0.0, "y": -26.87, "intensityFactor": 1, "width": 28.43, "height": 10.87, "forceType": "attract"},
                {"name": "775.3", "x": -5.0, "y": -11.31, "intensityFactor": 1, "width": 4.36, "height": 5.35, "forceType": "attract"}
            ]
        }
]},
{ "name": "Time - PP - descent", "nodes": [
        { "id": "time", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 10.70208333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.10", "x": 35.0, "y": 7.34, "intensityFactor": 1, "width": 12.09, "height": 5.17, "forceType": "attract"},
                {"name": "072.8", "x": 35.0, "y": 7.34, "intensityFactor": 1, "width": 12.09, "height": 5.17, "forceType": "attract"},
                {"name": "192.11", "x": 30.0, "y": -41.63, "intensityFactor": 1, "width": 10.16, "height": 2.85, "forceType": "attract"},
                {"name": "192.5", "x": 0.0, "y": 20.54, "intensityFactor": 1, "width": 10.75, "height": 4.75, "forceType": "attract"},
                {"name": "241.2", "x": -57.5, "y": -19.29, "intensityFactor": 1, "width": 22.62, "height": 10.78, "forceType": "attract"},
                {"name": "378.3", "x": -47.5, "y": 6.87, "intensityFactor": 1, "width": 14.25, "height": 15.08, "forceType": "attract"},
                {"name": "404.5", "x": -37.5, "y": 0.0, "intensityFactor": 1, "width": 15.19, "height": 15.19, "forceType": "attract"},
                {"name": "404.6", "x": 30.0, "y": 13.98, "intensityFactor": 1, "width": 11.42, "height": 4.9, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "599.7", "x": 42.5, "y": -62.49, "intensityFactor": 1, "width": 43.6, "height": 6.35, "forceType": "attract"},
                {"name": "822.11", "x": 32.5, "y": 0.0, "intensityFactor": 1, "width": 11.42, "height": 5.09, "forceType": "attract"},
                {"name": "930.4", "x": 32.5, "y": -23.75, "intensityFactor": 1, "width": 15.94, "height": 6.29, "forceType": "attract"}
            ]
        }
]},
{ "name": "Weather - PP - descent", "nodes": [
        { "id": "weather", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 16.42333333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "241.3", "x": 52.5, "y": 32.03, "intensityFactor": 1, "width": 9.8, "height": 3.62, "forceType": "attract"},
                {"name": "241.7", "x": -45.0, "y": 33.55, "intensityFactor": 1, "width": 11.42, "height": 3.69, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"}
            ]
        }
    ]
}




];

export const preppedNodes2 = [

{"name": "Aero - PP - ascent", "nodes": [
        {"id": "aero", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 0, "isFixed": false, "significance": 100, "hotspots": []
        },
]},
{"name": "Braking - PP - ascent", "nodes": [
        {"id": "braking", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 13.26, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.4", "x": 10.0, "y": -41.63, "intensityFactor": 1, "width": 20.16, "height": 22.54, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"}
            ]
        },
]},
{"name": "Cadence - PP - ascent", "nodes": [
        {"id": "cadence", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 14.52, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.12", "x": -10.0, "y": -24.01, "intensityFactor": 1, "width": 8.32, "height": 3.8, "forceType": "attract"},
                {"name": "192.12", "x": 45.0, "y": -17.94, "intensityFactor": 1, "width": 7.63, "height": 8.29, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "787.7", "x": 37.5, "y": -30.96, "intensityFactor": 1, "width": 17.86, "height": 7.01, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"}
            ]
        },
]},
{"name": "Distance - PP - ascent", "nodes": [
        {"id": "distance", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 11.96833333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.11", "x": 5.0, "y": 12.76, "intensityFactor": 1, "width": 9.35, "height": 4.58, "forceType": "attract"},
                {"name": "136.11", "x": -47.5, "y": 15.44, "intensityFactor": 1, "width": 18.71, "height": 11.06, "forceType": "attract"},
                {"name": "136.12", "x": 45.0, "y": 6.83, "intensityFactor": 1, "width": 23.99, "height": 16.44, "forceType": "attract"},
                {"name": "192.9", "x": -42.5, "y": 2.07, "intensityFactor": 1, "width": 10.39, "height": 5.19, "forceType": "attract"},
                {"name": "241.8", "x": 65.0, "y": 1.14, "intensityFactor": 1, "width": 11.42, "height": 4.58, "forceType": "attract"},
                {"name": "378.2", "x": -60.0, "y": 19.52, "intensityFactor": 1, "width": 15.19, "height": 3.72, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.8", "x": 25.0, "y": 6.67, "intensityFactor": 1, "width": 22.62, "height": 6.51, "forceType": "attract"},
                {"name": "408.10", "x": 50.0, "y": 11.92, "intensityFactor": 1, "width": 38.31, "height": 23.12, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "502.6", "x": 30.0, "y": -12.88, "intensityFactor": 1, "width": 14.65, "height": 4.78, "forceType": "attract"},
                {"name": "599.3", "x": -55.0, "y": -56.89, "intensityFactor": 1, "width": 33.4, "height": 10.4, "forceType": "attract"},
                {"name": "679.4", "x": -7.5, "y": 3.26, "intensityFactor": 1, "width": 4.36, "height": 4.33, "forceType": "attract"},
                {"name": "679.7", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 40.27, "height": 10.7, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "787.10", "x": 12.5, "y": 8.06, "intensityFactor": 1, "width": 15.53, "height": 12.81, "forceType": "attract"},
                {"name": "787.6", "x": 0.0, "y": 32.23, "intensityFactor": 1, "width": 20.29, "height": 2.19, "forceType": "attract"},
                {"name": "822.12", "x": 35.0, "y": -21.8, "intensityFactor": 1, "width": 17.86, "height": 6.07, "forceType": "attract"},
                {"name": "822.13", "x": -47.5, "y": -2.45, "intensityFactor": 1, "width": 11.42, "height": 19.44, "forceType": "attract"},
                {"name": "857.4", "x": 25.0, "y": -63.43, "intensityFactor": 1, "width": 36.01, "height": 17.79, "forceType": "attract"},
                {"name": "989.8", "x": 12.5, "y": -24.09, "intensityFactor": 1, "width": 16.07, "height": 8.6, "forceType": "attract"}
            ]
        },
]},
{"name": "Elevation - PP - ascent", "nodes": [
        {"id": "elevation", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.426875, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "192.9", "x": -42.5, "y": 2.07, "intensityFactor": 1, "width": 10.39, "height": 5.19, "forceType": "attract"},
                {"name": "241.9", "x": 0.0, "y": 27.54, "intensityFactor": 1, "width": 11.42, "height": 13.84, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.7", "x": 25.0, "y": 2.51, "intensityFactor": 1, "width": 22.62, "height": 21.21, "forceType": "attract"},
                {"name": "378.8", "x": 25.0, "y": 6.67, "intensityFactor": 1, "width": 22.62, "height": 6.51, "forceType": "attract"},
                {"name": "423.9", "x": 0.0, "y": 13.98, "intensityFactor": 1, "width": 5.72, "height": 4.9, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "989.10", "x": 0.0, "y": -13.5, "intensityFactor": 1, "width": 15.94, "height": 13.31, "forceType": "attract"}
            ]
        },
]},
{"name": "Gears - PP - ascent", "nodes": [
        {"id": "gears", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 5.72, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "679.2", "x": -37.5, "y": -8.28, "intensityFactor": 1, "width": 8.32, "height": 14.36, "forceType": "attract"},
                {"name": "775.4", "x": 10.0, "y": 1.63, "intensityFactor": 1, "width": 6.54, "height": 3.27, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"}
            ]
        },
]},
{"name": "Gradient - PP - ascent", "nodes": [
        {"id": "gradient", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.915, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "136.10", "x": 0.0, "y": -23.2, "intensityFactor": 1, "width": 14.65, "height": 11.99, "forceType": "attract"},
                {"name": "136.3", "x": -47.5, "y": -28.98, "intensityFactor": 1, "width": 12.29, "height": 7.7, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.8", "x": 25.0, "y": 6.67, "intensityFactor": 1, "width": 22.62, "height": 6.51, "forceType": "attract"},
                {"name": "408.10", "x": 50.0, "y": 11.92, "intensityFactor": 1, "width": 38.31, "height": 23.12, "forceType": "attract"},
                {"name": "423.9", "x": 0.0, "y": 13.98, "intensityFactor": 1, "width": 5.72, "height": 4.9, "forceType": "attract"},
                {"name": "502.6", "x": 30.0, "y": -12.88, "intensityFactor": 1, "width": 14.65, "height": 4.78, "forceType": "attract"},
                {"name": "599.10", "x": -75.0, "y": -53.9, "intensityFactor": 1, "width": 13.04, "height": 7.7, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "787.11", "x": 17.5, "y": 1.58, "intensityFactor": 1, "width": 21.04, "height": 14.62, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "930.10", "x": -42.5, "y": 3.59, "intensityFactor": 1, "width": 17.95, "height": 5.97, "forceType": "attract"},
                {"name": "989.10", "x": 0.0, "y": -13.5, "intensityFactor": 1, "width": 15.94, "height": 13.31, "forceType": "attract"}
            ]
        },
]},
{"name": "Heartrate - PP - ascent", "nodes": [
        {"id": "heartrate", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 12.49833333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.6", "x": 10.0, "y": -24.01, "intensityFactor": 1, "width": 9.35, "height": 3.8, "forceType": "attract"},
                {"name": "192.8", "x": -30.0, "y": -41.63, "intensityFactor": 1, "width": 5.09, "height": 2.85, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.3", "x": -62.5, "y": 23.82, "intensityFactor": 1, "width": 8.89, "height": 5.47, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "502.7", "x": -45.0, "y": -66.37, "intensityFactor": 1, "width": 37.85, "height": 6.55, "forceType": "attract"},
                {"name": "679.6", "x": -55.0, "y": -63.43, "intensityFactor": 1, "width": 33.4, "height": 6.4, "forceType": "attract"},
                {"name": "787.9", "x": -42.5, "y": -14.93, "intensityFactor": 1, "width": 22.62, "height": 17.58, "forceType": "attract"},
                {"name": "822.10", "x": -32.5, "y": -6.84, "intensityFactor": 1, "width": 16.69, "height": 13.59, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "930.8", "x": 32.5, "y": -10.2, "intensityFactor": 1, "width": 17.06, "height": 5.63, "forceType": "attract"},
                {"name": "989.6", "x": -17.5, "y": -24.23, "intensityFactor": 1, "width": 8.58, "height": 9.12, "forceType": "attract"}
            ]
        },
]},
{"name": "Hydration - PP - ascent", "nodes": [
        {"id": "hydration", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.275, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "192.10", "x": -80.0, "y": -48.81, "intensityFactor": 1, "width": 4.91, "height": 7.54, "forceType": "attract"},
                {"name": "408.7", "x": 55.0, "y": -5.0, "intensityFactor": 1, "width": 8.58, "height": 14.2, "forceType": "attract"},
                {"name": "502.7", "x": -45.0, "y": -66.37, "intensityFactor": 1, "width": 37.85, "height": 6.55, "forceType": "attract"},
                {"name": "679.15", "x": 52.5, "y": -66.37, "intensityFactor": 1, "width": 40.75, "height": 11.77, "forceType": "attract"},
                {"name": "787.4", "x": -37.5, "y": 22.18, "intensityFactor": 1, "width": 5.21, "height": 4.13, "forceType": "attract"},
                {"name": "822.9", "x": -42.5, "y": 18.73, "intensityFactor": 1, "width": 11.42, "height": 12.73, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "903.3", "x": 50.0, "y": -60.64, "intensityFactor": 1, "width": 22.62, "height": 4.99, "forceType": "attract"}
            ]
        },
]},
{"name": "Lactate - PP - ascent", "nodes": [
        {"id": "lactate", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 8.53, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "930.9", "x": 32.5, "y": -16.7, "intensityFactor": 1, "width": 17.06, "height": 5.48, "forceType": "attract"}
            ]
        },
]},
{"name": "Navigation - PP - ascent", "nodes": [
        {"id": "navigation", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 9.703421053, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.15", "x": -2.5, "y": -12.41, "intensityFactor": 1, "width": 10.29, "height": 11.16, "forceType": "attract"},
                {"name": "072.3", "x": -2.5, "y": -4.68, "intensityFactor": 1, "width": 21.62, "height": 25.53, "forceType": "attract"},
                {"name": "072.4", "x": 10.0, "y": -41.63, "intensityFactor": 1, "width": 20.16, "height": 22.54, "forceType": "attract"},
                {"name": "136.12", "x": 45.0, "y": 6.83, "intensityFactor": 1, "width": 23.99, "height": 16.44, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"},
                {"name": "241.4", "x": 0.0, "y": 33.28, "intensityFactor": 1, "width": 15.94, "height": 3.78, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.7", "x": 25.0, "y": 2.51, "intensityFactor": 1, "width": 22.62, "height": 21.21, "forceType": "attract"},
                {"name": "408.9", "x": 0.0, "y": -5.27, "intensityFactor": 1, "width": 10.55, "height": 10.5, "forceType": "attract"},
                {"name": "502.4", "x": 0.0, "y": 0.0, "intensityFactor": 1, "width": 22.62, "height": 34.35, "forceType": "attract"},
                {"name": "599.4", "x": -60.0, "y": -79.38, "intensityFactor": 1, "width": 36.87, "height": 7.03, "forceType": "attract"},
                {"name": "599.9", "x": 60.0, "y": -79.38, "intensityFactor": 1, "width": 29.86, "height": 5.63, "forceType": "attract"},
                {"name": "679.14", "x": 10.0, "y": -30.31, "intensityFactor": 1, "width": 14.9, "height": 8.36, "forceType": "attract"},
                {"name": "679.9", "x": -2.5, "y": -24.87, "intensityFactor": 1, "width": 12.45, "height": 26.46, "forceType": "attract"},
                {"name": "775.3", "x": -5.0, "y": -11.31, "intensityFactor": 1, "width": 4.36, "height": 5.35, "forceType": "attract"},
                {"name": "787.10", "x": 12.5, "y": 8.06, "intensityFactor": 1, "width": 15.53, "height": 12.81, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "903.5", "x": 0.0, "y": -17.1, "intensityFactor": 1, "width": 6.16, "height": 30.44, "forceType": "attract"},
                {"name": "903.6", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 33.4, "height": 18.61, "forceType": "attract"}
            ]
        },
]},
{"name": "Nutrition - PP - ascent", "nodes": [
        {"id": "nutrition", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 11.12625, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "408.8", "x": 35.0, "y": -4.29, "intensityFactor": 1, "width": 8.58, "height": 12.8, "forceType": "attract"},
                {"name": "679.15", "x": 52.5, "y": -66.37, "intensityFactor": 1, "width": 40.75, "height": 11.77, "forceType": "attract"},
                {"name": "857.5", "x": 12.5, "y": -19.29, "intensityFactor": 1, "width": 17.06, "height": 10.78, "forceType": "attract"},
                {"name": "903.3", "x": 50.0, "y": -60.64, "intensityFactor": 1, "width": 22.62, "height": 4.99, "forceType": "attract"}
            ]
        },
]},
{"name": "Power - PP - ascent", "nodes": [
        {"id": "power", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 11.23433333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.13", "x": 0.0, "y": -24.44, "intensityFactor": 1, "width": 8.32, "height": 2.84, "forceType": "attract"},
                {"name": "136.5", "x": -47.5, "y": -20.47, "intensityFactor": 1, "width": 19.67, "height": 12.83, "forceType": "attract"},
                {"name": "192.12", "x": 45.0, "y": -17.94, "intensityFactor": 1, "width": 7.63, "height": 8.29, "forceType": "attract"},
                {"name": "241.6", "x": -57.5, "y": -5.71, "intensityFactor": 1, "width": 13.69, "height": 6.83, "forceType": "attract"},
                {"name": "378.3", "x": -47.5, "y": 6.87, "intensityFactor": 1, "width": 14.25, "height": 15.08, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "378.9", "x": 0.0, "y": -82.87, "intensityFactor": 1, "width": 0.0, "height": 0.0, "forceType": "attract"},
                {"name": "404.7", "x": 0.0, "y": 1.86, "intensityFactor": 1, "width": 13.31, "height": 13.27, "forceType": "attract"},
                {"name": "404.8", "x": 0.0, "y": -26.05, "intensityFactor": 1, "width": 39.15, "height": 51.2, "forceType": "attract"},
                {"name": "408.4", "x": -47.5, "y": 23.82, "intensityFactor": 1, "width": 8.89, "height": 5.47, "forceType": "attract"},
                {"name": "408.5", "x": -40.0, "y": 6.35, "intensityFactor": 1, "width": 11.42, "height": 8.31, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "679.10", "x": 60.0, "y": -19.8, "intensityFactor": 1, "width": 18.18, "height": 17.12, "forceType": "attract"},
                {"name": "787.5", "x": 27.5, "y": -12.88, "intensityFactor": 1, "width": 25.75, "height": 9.55, "forceType": "attract"},
                {"name": "903.6", "x": 0.0, "y": -69.44, "intensityFactor": 1, "width": 33.4, "height": 18.61, "forceType": "attract"}
            ]
        },
]},
{"name": "Speed - PP - ascent", "nodes": [
        {"id": "speed", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 10.7302381, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.14", "x": 45.0, "y": -1.91, "intensityFactor": 1, "width": 17.06, "height": 7.62, "forceType": "attract"},
                {"name": "136.11", "x": -47.5, "y": 15.44, "intensityFactor": 1, "width": 18.71, "height": 11.06, "forceType": "attract"},
                {"name": "136.9", "x": 45.0, "y": -23.11, "intensityFactor": 1, "width": 10.66, "height": 9.81, "forceType": "attract"},
                {"name": "192.4", "x": 0.0, "y": -27.61, "intensityFactor": 1, "width": 5.29, "height": 30.5, "forceType": "attract"},
                {"name": "192.6", "x": 47.5, "y": -48.81, "intensityFactor": 1, "width": 6.54, "height": 4.31, "forceType": "attract"},
                {"name": "241.5", "x": 60.0, "y": -13.74, "intensityFactor": 1, "width": 15.19, "height": 12.32, "forceType": "attract"},
                {"name": "378.6", "x": 0.0, "y": -63.43, "intensityFactor": 1, "width": 46.05, "height": 27.64, "forceType": "attract"},
                {"name": "408.6", "x": -32.5, "y": 21.61, "intensityFactor": 1, "width": 8.89, "height": 6.86, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "423.7", "x": 0.0, "y": -19.57, "intensityFactor": 1, "width": 5.09, "height": 4.8, "forceType": "attract"},
                {"name": "502.5", "x": 27.5, "y": -5.38, "intensityFactor": 1, "width": 13.42, "height": 10.71, "forceType": "attract"},
                {"name": "599.11", "x": 0.0, "y": 28.9, "intensityFactor": 1, "width": 12.29, "height": 3.28, "forceType": "attract"},
                {"name": "599.5", "x": -22.5, "y": -67.38, "intensityFactor": 1, "width": 22.62, "height": 6.6, "forceType": "attract"},
                {"name": "679.5", "x": 40.0, "y": -16.7, "intensityFactor": 1, "width": 41.61, "height": 23.8, "forceType": "attract"},
                {"name": "775.6", "x": 0.0, "y": -66.37, "intensityFactor": 1, "width": 19.46, "height": 11.77, "forceType": "attract"},
                {"name": "787.8", "x": 35.0, "y": -22.5, "intensityFactor": 1, "width": 21.04, "height": 10.56, "forceType": "attract"},
                {"name": "822.6", "x": 35.0, "y": -12.68, "intensityFactor": 1, "width": 18.46, "height": 9.76, "forceType": "attract"},
                {"name": "857.4", "x": 25.0, "y": -63.43, "intensityFactor": 1, "width": 36.01, "height": 17.79, "forceType": "attract"},
                {"name": "857.6", "x": -25.0, "y": -5.38, "intensityFactor": 1, "width": 16.07, "height": 21.23, "forceType": "attract"},
                {"name": "903.4", "x": 55.0, "y": -60.64, "intensityFactor": 1, "width": 27.47, "height": 11.2, "forceType": "attract"},
                {"name": "989.7", "x": 0.0, "y": -24.23, "intensityFactor": 1, "width": 11.42, "height": 5.22, "forceType": "attract"}
            ]
        },
]},
{"name": "Strategy - PP - ascent", "nodes": [
        {"id": "strategy", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 2.675, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "775.3", "x": -5.0, "y": -11.31, "intensityFactor": 1, "width": 4.36, "height": 5.35, "forceType": "attract"}
            ]
        },
]},
{"name": "Time - PP - ascent", "nodes": [
        {"id": "time", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 11.07045455, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "072.10", "x": 45.0, "y": 7.34, "intensityFactor": 1, "width": 12.09, "height": 5.17, "forceType": "attract"},
                {"name": "072.8", "x": 35.0, "y": 7.34, "intensityFactor": 1, "width": 12.09, "height": 5.17, "forceType": "attract"},
                {"name": "192.11", "x": 30.0, "y": -41.63, "intensityFactor": 1, "width": 10.16, "height": 2.85, "forceType": "attract"},
                {"name": "192.5", "x": 0.0, "y": 20.54, "intensityFactor": 1, "width": 10.75, "height": 4.75, "forceType": "attract"},
                {"name": "241.2", "x": -57.5, "y": -19.29, "intensityFactor": 1, "width": 22.62, "height": 10.78, "forceType": "attract"},
                {"name": "378.3", "x": -47.5, "y": 6.87, "intensityFactor": 1, "width": 14.25, "height": 15.08, "forceType": "attract"},
                {"name": "404.7", "x": 0.0, "y": 1.86, "intensityFactor": 1, "width": 13.31, "height": 13.27, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"},
                {"name": "599.7", "x": 42.5, "y": -62.49, "intensityFactor": 1, "width": 43.6, "height": 6.35, "forceType": "attract"},
                {"name": "822.11", "x": 32.5, "y": 0.0, "intensityFactor": 1, "width": 11.42, "height": 5.09, "forceType": "attract"},
                {"name": "930.4", "x": 32.5, "y": -23.75, "intensityFactor": 1, "width": 15.94, "height": 6.29, "forceType": "attract"}
            ]
        }
    ]
},
{"name": "Weather - PP - ascent", "nodes": [
        {"id": "weather", "representation": "number", "x": -50, "y": 100, "color": "random", "radius": 16.42333333, "isFixed": false, "significance": 100, "hotspots": [
                {"name": "241.3", "x": 52.5, "y": 32.03, "intensityFactor": 1, "width": 9.8, "height": 3.62, "forceType": "attract"},
                {"name": "241.7", "x": -45.0, "y": 33.55, "intensityFactor": 1, "width": 11.42, "height": 3.69, "forceType": "attract"},
                {"name": "423.3", "x": 0.0, "y": -67.38, "intensityFactor": 1, "width": 77.32, "height": 10.98, "forceType": "attract"}
            ]
        },
]},




];

export const preppedNodesExtended = [

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
