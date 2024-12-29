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
import { makeDraggableWithClone } from 'vvvyyynet_utils_maplibre';
```

## Features


### Important Usage Notes
- **All features must have a unique `properties.id`.** This is essential for addFeatures/addLayers to work on mixed-type GeoJSON Feature Collections. The id can be **any string** and it does not have to correspond to the id that is passed to the sourceId and layerId. Behind the scenes maplibre-gl will use the these ids as unique handles for the features for filtering (`filter: ['==', ['get', 'id'], feature.properties.id]`). If no id is provided, the styling gets shared/mixed up between items within the same source.
- **Force and Pseudo-Fallbacks**: Currently, there is a wrapper-side coalesce function in place that evaluates the provided stylings according to the following priority: (1) manualStyling *inside* the `force` object, (2) GeoJSONStyling, (3) manualStyling *outside* the `force` object, (4) default values provided in addFeatures (may move them to their in own DEFAULTS.json file).
  - Importantly, the 'fallbacks' only jump in if the prior steps resulted in *undefined*. However, if invalid values are passed to any of the style-objects, they will be chosen and fed to maplibre-gl. This may lead to errors, or to features simply not showing on the map. This should be more robust in the future!
- **Fill-Pattern:** Unfortunately, the `fill-pattern` property cannot be unset. Either set it to the id of a registered image (could be completely transparent...), or remove the line. This is sort of a restriction for a standalone-wrapper-function that does not do the wrapping part... //! SOLVE THIS!

### Shared features

### Features for clone-dragging

## Todo
### General/NPM
- feat: add automatic semanticVersioning
- check the //! TODO flags
- solve fill-pattern-problem (same goes for iconName, I guess...)

### Fixes
- test: array-syntax alone
- fix: array-syntax won't work when mixed with e.g. lineWidth -> consider adding the manualStyles to the geoJSON file during `addFeatures` and then using maplibre's internal coalesce syntax. I guess, when applied on internal properties only, it should work fine.
- fix: if a boolean is false it will be just fallbacked? What then? Pass as string? Why is setInvisible still working??
- fix: move imports of CAPITALISED GLOBALS like FEATURES etc. to function arguments
- fix: improve the checks and fallbacks inside addLayer for the various nested stylings
- refactor: consider moving points_style inside style alltogether

### Features
- feat: appart from 'circle'... are there any other maplibregl-default icons?

### Chore and Refactor
