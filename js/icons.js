export const iconDefs = [
    {key: '01', url: new URL('../img/icons/icon_01.svg', import.meta.url).href},
    {key: '02', url: new URL('../img/icons/icon_02.svg', import.meta.url).href},
    {key: '03', url: new URL('../img/icons/icon_03.svg', import.meta.url).href},
    {key: '04', url: new URL('../img/icons/icon_04.svg', import.meta.url).href},
    {key: 'count', url: new URL('../img/icons/icon_count.svg', import.meta.url).href},
    {key: 'fill', url: new URL('../img/icons/icon_fill.svg', import.meta.url).href},
    {key: 'graph', url: new URL('../img/icons/icon_graph.svg', import.meta.url).href},
    {key: 'linear1', url: new URL('../img/icons/icon_linear1.svg', import.meta.url).href},
    {key: 'linear2', url: new URL('../img/icons/icon_linear2.svg', import.meta.url).href},
    {key: 'map', url: new URL('../img/icons/icon_map.svg', import.meta.url).href},
    {key: 'navigation', url: new URL('../img/icons/icon_navigation.svg', import.meta.url).href},
    {key: 'number', url: new URL('../img/icons/icon_number.svg', import.meta.url).href},
    {key: 'radial', url: new URL('../img/icons/icon_radial.svg', import.meta.url).href},
    {key: 'sound', url: new URL('../img/icons/icon_sound.svg', import.meta.url).href},
    {key: 'symbol', url: new URL('../img/icons/icon_symbol.svg', import.meta.url).href},
    {key: 'text', url: new URL('../img/icons/icon_text.svg', import.meta.url).href},
    // {key: 'none', url: new URL('../img/icons/icon_none.svg', import.meta.url).href},
];

/* build {number:url, 03:url, …} for quick access */
export const iconByKey = Object.fromEntries(
    iconDefs.map(d => [d.key, d.url])
  );

export function randomRepresentation() {
    const randomIndex = Math.floor(Math.random() * iconDefs.length); // Generate a random index
    return iconDefs[randomIndex].key; // Return the key of the random icon
}