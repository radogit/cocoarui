export const iconDefs = [
    {key: '01', url: require('../img/icons/icon_01.svg')},
    {key: '02', url: require('../img/icons/icon_02.svg')},
    {key: '03', url: require('../img/icons/icon_03.svg')},
    {key: '04', url: require('../img/icons/icon_04.svg')},
    {key: 'count', url: require('../img/icons/icon_count.svg')},
    {key: 'fill', url: require('../img/icons/icon_fill.svg')},
    {key: 'graph', url: require('../img/icons/icon_graph.svg')},
    {key: 'linear1', url: require('../img/icons/icon_linear1.svg')},
    {key: 'linear2', url: require('../img/icons/icon_linear2.svg')},
    {key: 'map', url: require('../img/icons/icon_map.svg')},
    {key: 'navigation', url: require('../img/icons/icon_navigation.svg')},
    {key: 'number', url: require('../img/icons/icon_number.svg')},
    {key: 'radial', url: require('../img/icons/icon_radial.svg')},
    {key: 'sound', url: require('../img/icons/icon_sound.svg')},
    {key: 'symbol', url: require('../img/icons/icon_symbol.svg')},
    {key: 'text', url: require('../img/icons/icon_text.svg')},
];

/* build {number:url, 03:url, …} for quick access */
export const iconByKey = Object.fromEntries(
    iconDefs.map(d => [d.key, d.url])
  );

export function randomRepresentation() {
    const randomIndex = Math.floor(Math.random() * iconDefs.length); // Generate a random index
    return iconDefs[randomIndex].key; // Return the key of the random icon
}