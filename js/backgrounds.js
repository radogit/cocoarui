// All background images (single sources). Presets combine these.
export const imagePaths = [
    { name: 'backgroundBottomBase',   label: 'Bottom base',    width: 180, height: 90, x: -90, y: 18,   fileWidth: 1173, fileHeight: 341, align: 'xMidYMax meet', url: require('./../img/background-bottom-base.png') },
    { name: 'backgroundTopUphill',    label: 'Top uphill',     width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, align: 'xMidYMin meet', url: require('./../img/background-top-uphill.jpg') },
    { name: 'backgroundTopDownhill',  label: 'Top downhill',   width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, align: 'xMidYMin meet', url: require('./../img/background-top-downhill.jpg') },
    { name: 'backgroundVRDownhill',   label: 'VR downhill',    width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, align: 'xMidYMin meet', url: require('./../img/background-top-downhill.jpg') }, // replace url with VR asset when available
    { name: 'backgroundVRUphill',     label: 'VR uphill',      width: 180, height: 90, x: -90, y: -44,  fileWidth: 1173, fileHeight: 468, align: 'xMidYMin meet', url: require('./../img/background-top-uphill.jpg') },   // replace url with VR asset when available
];

// User chooses one preset; each preset shows a set of images by name.
export const backgroundPresets = [
    { id: 'base-downhill',  label: 'Base + Downhill',   imageNames: ['backgroundBottomBase', 'backgroundTopDownhill'] },
    { id: 'base-uphill',    label: 'Base + Uphill',     imageNames: ['backgroundBottomBase', 'backgroundTopUphill'] },
    { id: 'vr-downhill',    label: 'VR Downhill',       imageNames: ['backgroundVRDownhill'] },
    { id: 'vr-uphill',     label: 'VR Uphill',         imageNames: ['backgroundVRUphill'] },
];
