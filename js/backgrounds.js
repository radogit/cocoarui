// All background images (single sources). Presets combine these.
export const imagePaths = [
    { name: 'backgroundBottomBase',   label: 'Bottom base',    width: 180, height: 90, x: -90, y: 18,   fileWidth: 1173, fileHeight: 341, opacity: 1, align: 'xMidYMax meet', url: require('./../img/background-bottom-base.png') },
    { name: 'backgroundTopUphill',    label: 'Top uphill',     width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, opacity: 1, align: 'xMidYMin meet', url: require('./../img/background-top-uphill.jpg') },
    { name: 'backgroundTopDownhill',  label: 'Top downhill',   width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, opacity: 1, align: 'xMidYMin meet', url: require('./../img/background-top-downhill.jpg') },
    { name: 'backgroundVRDownhill',   label: 'VR downhill',    width: 360, height: 180, x: -180, y: -90,  fileWidth: 3840, fileHeight: 1920, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_descent1_2to1.png') }, // replace url with VR asset when available
    { name: 'backgroundVRUphill',     label: 'VR uphill',      width: 360, height: 180, x: -180, y: -90,  fileWidth: 3840, fileHeight: 1920, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_ascent1_2to1.png') },   // replace url with VR asset when available
    // { name: 'backgroundVRDownhill',   label: 'VR downhill',    width: 180, height: 124, x: -90, y: -34,  fileWidth: 1920, fileHeight: 1323, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_descent1_2to1_+2-withnogrid.png') }, // replace url with VR asset when available
    // { name: 'backgroundVRUphill',     label: 'VR uphill',      width: 180, height: 124, x: -90, y: -34,  fileWidth: 1920, fileHeight: 1323, opacity: 0.4, align: 'xMidYMin meet', url: require('./../img/screenshot_ascent1_2to1_+2-withnogrid.png') },   // replace url with VR asset when available
];

// User chooses one preset; each preset shows a set of images by name.
export const backgroundPresets = [
    { id: 'base-downhill',  label: 'Base + Downhill',   imageNames: ['backgroundBottomBase', 'backgroundTopDownhill'] },
    { id: 'base-uphill',    label: 'Base + Uphill',     imageNames: ['backgroundBottomBase', 'backgroundTopUphill'] },
    { id: 'vr-downhill',    label: 'VR Downhill',       imageNames: ['backgroundVRDownhill'] },
    { id: 'vr-uphill',     label: 'VR Uphill',         imageNames: ['backgroundVRUphill'] },
];
