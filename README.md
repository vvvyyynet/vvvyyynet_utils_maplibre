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

### Fixes
- *fix: opacity=0 is still ignored... is there a deeper level nullish/falsy mistake beyond the fixed coalesce? (otherwise... check if no maplibregl-bug, but it can't)

### Test
- test: does acceptTopLevelFeatureProps=true work as intended?

### Features
- *feat: add typescript support
- *feat: unset-all inside force
- *feat: unset specific inside force (e.g. fillPattern or iconImage)
- *feat: is collCallbacks the right name? should there be featCallbacks AND collCallbacks?
- *feat (performance): add caching all coalesce-parts that are not the feature, since they remain the same.
- *feat (performance): parse stylesheets and unify all variable names -> run cached coalesce -> use them directly in accumulate (no need to run this over everything!, however either filter out invalid keys, or use the list to filter the clean stylespec list)... well, unless featStyleset is not visible in the case of async adding... but will this ever be a thing? However... yeah, the logic will shift some levels up to addFeatureCollection. Ugly, but worth it for performance, I think. It's just a collecting-loop.
- *feat: add backdropCircles to corners of polygons and lines!
- *feat: inside coalesce(?) add a continueOnFail option (why would I not want to continue?)
- *feat: addCircle, addFill, addLine, addSymbol // addGlowLine and addBackdropCircle
	- also validate them (:Boolean (true|false)
	- allowed types: `add... = 'visible'|'none'|{fill:string ('visible'|'none'), line:string ('visible'|'none'),...}) 
	- should this be copied for visibility?: `visibility = 'visible'|'none'|{fill:string ('visible'|'none'), line:string ('visible'|'none'),...}) 
	- coalescion of object-version should only happen on the outside, i.e. on the object as a whole

- feat: consider adding coalesce also for filter?!
- feat: consider merging metadata from different stylesets... but it's not style... just two sources then: feat + coll (and maybe db and manual, but I think this needs be handled externally.)
- feat: improve `tweakGlowLineWidth()` such that it does not just check lineWidth[0]=='interpolate', but finds it nested inside, and then replaces from there. (there may be some other function around!). 
  - for the case, that there is a ['get','myLineWidth'] expression nested inside, I guess, there is no chance to change this, without going to the id.properties.
  - However, I have tested it, and the value will just be NaN, but the expression-array survives, which is not that bad news either. It just needs to be documented as a limitation.
- feat: add featStyleset support on the collection-level (may require renaming of collStyleset, which refers to the manual part, which for now is the only global one (appart from the presetStyleset) -- maybe into manipStyleset)
- feat: add typing for addGlow, addBackdrop, addCircle, addSymbol (but in a seperate stylespec. reference types from maplibre-stylespec instead of duplicating! 
- feat: consider using maplibre's internal validation function (I think there is one)... although: special values may be a reason NOT to migrat to internal validation later.
- feat: find solution for `GeometryCollection` maybe, this should sort of recall the function?!

### Chore and Refactor
- *chore: simplify names of `idColl` and `callback` using circle, line, fill, symbol, ... + specials
  - consider prefixing values with GlowLineColor or BackdropCircleRadius (requires extending the stylespecs (does it for callbacks and ids??) or using aliases, which is ugly) 
	- I guess it's best to just use 1-level-nesting instead of prefixing, since inside addLayer a circle and a backdropcircle are treated just the same! It's just the external bookkeeping that relies on separation, so nesting will do it.

- chore: rename plural/singular mess

### Document
- docu: why `addCircle` =/= `visibility` (since you may want to toggle ON/OFF some layers later but still draw them with initial visibility false.)
- docu: why use callbacks? (interactivity + diagnostics + )... for diagnostics... would the arguments need to be extended beyond layerId?
- docu: show the beauty of why lineWidth and circleStrokeWidh are not the same. (or: fillColor and circleColor). This is amazing, since it allows flattening!!!
  - discuss this in the context of the specials, which introduce ambiguity, since suddenly there are two lines and two circles with potentially different styling, which you don't want to mix! (think of somebody who wants to toggle between points.circle and points.symbol (with points.backdropCircles) -- then ALL need to be added, even though they will never be visible at the same time... suddenly, the usecase is here, where we need separatio somehow... either by prefixing the names (which requires extending the stylespecs (don't like to think of aliases! ugly ugly)) or by nesting... which is ugly (eventhough I got quite good at doing this... )). Similarly a separation is needed for callbacks, and for the idCollector (here additional question concerning all/glow/reg??).
- docu: linewidth must be set for glow, it won't work on the default.


### Historical (I guess this is solved?)
- fix: array-syntax won't work when mixed with e.g. lineWidth
- refactor: consider adding the manualStyles to the geoJSON file during `addFeatures` and then using maplibre's internal coalesce syntax. I guess, when applied to internal properties only, it should work fine.
- chore: move imports of CAPITALISED GLOBALS like FEATURES etc. to function arguments
- fix: solve fill-pattern-problem (same goes for iconName, I guess...)


## Style Guide

### Structure of idCollector (OLD)
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