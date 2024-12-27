//-------------------------------------------------------------------
// Useful utils
import { consoleLogAllLayers } from './utils/consoleLogAllLayers';
import { getMapPosition } from './utils/getMapPosition';
import { waitForStyleLoad } from './utils/waitForStyleLoad';

//-------------------------------------------------------------------
// Basemap
import { loadBasemaps } from './utils/loadBasemaps';
import { toggleBasemap } from './utils/toggleBasemap';
import { minimalStyle } from './utils/minimalStyle'; //! NEW

//----------------------------------------------
// Icons and Images
import { registerPNG } from './utils/registerPNG';
import { registerSVG } from './utils/registerSVG';

//----------------------------------------------
// Add Features
import { addFeatures } from './utils/addFeatures' //! NEW
import { addLayer } from './utils/addLayer';

//----------------------------------------------
// Add Georeferenced Images to Map
import { addGeoref } from './utils/addGeoref';
import { georef_addToMap } from './utils/georef_addToMap';
import { georef_removeFromMap } from './utils/georef_removeFromMap';
import { updateOpacity_allgiven_georef } from './utils/upadteOpacity_of_all_given_georefs';

//-------------------------------------------------------------------
// Georeferencing
import { georef_calculate_bounds } from './utils/georefCalculateBounds';
import { georef_convertWorldFile_epsg3857_to_bounds } from './utils/georef_convertWorldFile_epsg3857_to_bounds';
import { georef_convertWorldFile_to_bounds } from './utils/georef_convertWorldFile_to_bounds';
import { create_SourceId_from_LayerId } from './utils/create_sourceId_from_layerId';

//----------------------------------------------
// Toggles
import { toggleAllOff } from './utils/toggleAllOff';
import { toggleGeoref } from './utils/toggleGeoref';
import { toggleFeature } from './utils/toggleFeature';
import { toggleBackgrounds } from './utils/toggleBackgrounds';


//----------------------------------------------
// Legacy (JW-Map)
import { addFeatureGroupsFromDB } from './utils/addFeatureGroupsFromDB';
import { addStaticFeatures } from './utils/addStaticFeatures';

// ----------
// Notes
// - 2024-12-27 addFeatureGroupsFromDB, addStaticFeatures, addLayer(?) are still duplicated in JW-Map and must be removed there

// ----------
// Export
export {
	addFeatures,
	addFeatureGroupsFromDB,
	addStaticFeatures,
	addLayer,
	consoleLogAllLayers,
	getMapPosition,
	loadBasemaps,
	waitForStyleLoad,
	toggleBasemap,
	georef_calculate_bounds,
	georef_convertWorldFile_epsg3857_to_bounds,
	georef_convertWorldFile_to_bounds,
	create_SourceId_from_LayerId,
	registerPNG,
	registerSVG,
	addGeoref,
	georef_addToMap,
	georef_removeFromMap,
	updateOpacity_allgiven_georef,
	toggleAllOff,
	toggleGeoref,
	toggleFeature,
	toggleBackgrounds,
	minimalStyle
};
