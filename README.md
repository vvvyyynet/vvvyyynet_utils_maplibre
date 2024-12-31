# vvvyyynet_utils_maplibre

A collection of utility functions for various tasks.

## Installation

```bash
npm install vvvyyynet_utils_maplibre
```
Or simply link it offline

```bash
npm link # in this repo
npm link vvvyyynet_utils_maplibre # in consumer repo
```

## Usage

```bash
import { addFeatureCollection } from 'vvvyyynet_utils_maplibre';
```

## Features


### Important Usage Notes
- **All features must have a unique `properties.id`.** This is essential for addFeatures/addLayers to work on mixed-type GeoJSON Feature Collections. The id can be **any string** and it does not have to correspond to the id that is passed to the sourceId and layerId. Behind the scenes maplibre-gl will use the these ids as unique handles for the features for filtering (`filter: ['==', ['get', 'id'], feature.properties.id]`). If no id is provided, the styling gets shared/mixed up between items within the same source.
- **Force and Pseudo-Fallbacks**: Currently, there is a wrapper-side coalesce function in place that evaluates the provided stylings according to the following priority: (1) manualStyling *inside* the `force` object, (2) GeoJSONStyling, (3) manualStyling *outside* the `force` object, (4) default values provided in addFeatures (may move them to their in own DEFAULTS.json file).
  - Importantly, the 'fallbacks' only jump in if the prior steps resulted in *undefined*. However, if invalid values are passed to any of the style-objects, they will be chosen and fed to maplibre-gl. This may lead to errors, or to features simply not showing on the map. This should be more robust in the future!
- **Fill-Pattern:** Unfortunately, the `fill-pattern` property cannot be unset. Either set it to the id of a registered image (could be completely transparent...), or remove the line. This is sort of a restriction for a standalone-wrapper-function that does not do the wrapping part... //! SOLVE THIS!
- **LineDashArray and Glow:** Since line-dasharray is in units of line-width it will affect the glow differently leading to two unsynced dashed lines. To compensate for this, all values of glow.lineDashArray property must be set inversely proportional.

**LineGlow:** Available for lines and contourlines. In addition to the `line-blur` property, you can set a different color. Internally, a second layer is drawn with a pre-/postfixed layerId. The glow must be slightly wider than the line. You can either provide a `lineWidth` or a multiplication factor (`lineWidthGlowFactor`). Note that the latter not work, if the lineWidth defaults to the maplibregl-fallback linewidth (wich would be very tiny anyways), since the multiplication is handled inside the wrapper but not forwarded to maplibregl...
- LineGlow also works with interpolate-expressions, as long as they are not nested (i.e. `lineWidth: ['interpolate', ['linear'],['zoom'], 0,10, 20, ['get','myValue']]` will be converted to `lineWidth: ['interpolate', ['linear'],['zoom'], 0,10, 20, NaN]`)



## Todo
### General/NPM
- feat: add automatic semanticVersioning
- check the //! TODO flags
- solve fill-pattern-problem (same goes for iconName, I guess...)

### Fixes
- fix: linewidth must be set for glow, it won't work on the default.
- test: array-syntax alone
- fix: array-syntax won't work when mixed with e.g. lineWidth -> consider adding the manualStyles to the geoJSON file during `addFeatures` and then using maplibre's internal coalesce syntax. I guess, when applied on internal properties only, it should work fine.
- fix: if a boolean is false it will be just fallbacked? What then? Pass as string? Why is setInvisible still working??
- fix: move imports of CAPITALISED GLOBALS like FEATURES etc. to function arguments
- fix: improve the checks and fallbacks inside addLayer for the various nested stylings
- refactor: consider moving points_style inside style alltogether
- fix: copy lineCap of Glow from regular line

### Features
- feat: add all properties to addLayer.js
- feat: unset-all inside force
- feat: unset specific inside force (e.g. fillPattern or iconImage)
- feat: add a callbackFunction to addFeatureCollection()
- feat: appart from 'circle'... are there any other maplibregl-default icons?
- feat: improve `tweakGlowLineWidth()` such that it does not just check lineWidth[0]=='interpolate', but finds it nested inside, and then replaces from there. (there may be some other function around!). 
  - for the case, that there is a ['get','myLineWidth'] expression nested inside, I guess, there is no chance to change this, without going to the id.properties.
  - However, I have tested it, and the value will just be NaN, but the expression-array survives, which is not that bad news either. It just needs to be documented as a limitation.
- feat: add types in accumulateKeyValuePairs(..., allowedTypes)
- feat: add typescript
- feat: add featStyleset support on the collection-level (may require renaming of collStyleset, which refers to the manual part, which for now is the only global one (appart from the presetStyleset) -- maybe into manipStyleset)

### Chore and Refactor
- chore: externalise makeInteractive()





## Style Guide

### Structure of idCollector
- The object-tree will be expanded as needed, so you can start with just {}.
- Note, that if e.g. `idCollector = {shapes: "not an object"}` shapes will be overwritten.

```js
idCollector = {
			all: [],
			shapes: {
				symbols: [],
				circles: [],
				lines: [],
				fills: [],
				special: {
					backdropCircles: [],
					lineGlows: []
				}
			},
			types: {
				points: {
					all: [],
					symbols: [],
					circles: [],
					backdropCircles: []
				},
				lines: {
					all: [],
					lines: {
						all: [],
						glows: []
					},
					corners: {
						all: [],
						symbols: [],
						circles: []
					}
				},
				polygons: {
					all: [],
					fills: [],
					contours: {
						all: [],
						glows: []
					},
					corners: {
						all: [],
						symbols: [],
						circles: []
					}
				}
			}
		}
```