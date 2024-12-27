
const DEFAULT_VERSION = 8;
const DEFAULT_GLYPHS = 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf';


export function minimalStyle({v=DEFAULT_VERSION, glyphs=DEFAULT_GLYPHS}) {
  // Usage:
  // map = new maplibregl.Map({minimalStyle({})})
  // 
  // 
  // Context:
  // The style property cannot be left just blank but must contain some minimal information.
  // 
  // Normally you would set the style property to a basemap, for example...
  //   - style: 'https://demotiles.maplibre.org/style.json'
  //   - style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  // 
  // In this case, all required style properties would be provided by the basemap. However, if 
  // basemaps are added later as regular layers (e.g. for switching between two basemaps, none
  // of which should be 'default') it would be unnecessary overhead to also load a default. 


  return {
    version: v, // Required version
    sources: {}, // Empty sources object
    layers: [], // Empty layers array
    glyphs: glyphs
  };
}