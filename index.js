//-------------------------------------------------------------------
// Useful utils
import { consoleLogAllLayers } from './utils/consoleLogAllLayers';
import { getMapPosition } from './utils/getMapPosition';
import { waitForStyleLoad } from './utils/waitForStyleLoad';

//-------------------------------------------------------------------
// Basemap
import { loadBasemaps } from './utils/loadBasemaps';
import { toggleBasemap } from './utils/toggleBasemap';

//-------------------------------------------------------------------
// Georeferencing
import { georef_calculate_bounds } from './utils/georefCalculateBounds';
import { georef_convertWorldFile_epsg3857_to_bounds } from './utils/georef_convertWorldFile_epsg3857_to_bounds';
import { georef_convertWorldFile_to_bounds } from './utils/georef_convertWorldFile_to_bounds';
import { create_SourceId_from_LayerId } from './utils/create_sourceId_from_layerId';

//----------------------------------------------
// Icons and Images
import { registerPNG } from './utils/registerPNG';
import { registerSVG } from './utils/registerSVG';

//----------------------------------------------
// Add Georeferenced Images to Map
import { addGeoref } from './utils/addGeoref';
import { georef_addToMap } from './utils/georef_addToMap';
import { georef_removeFromMap } from './utils/georef_removeFromMap';
import { updateOpacity_allgiven_georef } from './utils/upadteOpacity_of_all_given_georefs';

//----------------------------------------------
// Toggles
import { toggleAllOff } from './utils/toggleAllOff';
import { toggleGeoref } from './utils/toggleGeoref';
import { toggleFeature } from './utils/toggleFeature';
import { toggleBackgrounds } from './utils/toggleBackgrounds';

export {
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
	toggleBackgrounds
};
